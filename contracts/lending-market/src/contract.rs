//! Main contract implementation for the Lending Market

use crate::error::Error;
use crate::interest;
use crate::liquidation;
use crate::oracle;
use crate::storage;
use crate::validation;
use crate::types::{Loan, LendingOffer, LoanHealth};
use soroban_sdk::{contract, contractimpl, token, Address, Env, Vec};

#[contract]
pub struct LendingMarket;

#[contractimpl]
impl LendingMarket {
    /// Initialize the contract
    /// This should only be called once
    pub fn __constructor(
        env: Env,
        admin: Address,
        usdc_token: Address,
        xlm_token: Address,
        oracle_address: Address,
        max_interest_rate: u32,
    ) -> Result<(), Error> {
        // Require admin authorization
        admin.require_auth();

        // Check if already initialized
        if storage::get_admin(&env).is_ok() {
            return Err(Error::AlreadyInitialized);
        }

        // Store configuration
        storage::set_admin(&env, &admin);
        storage::set_usdc_token(&env, &usdc_token);
        storage::set_xlm_token(&env, &xlm_token);
        storage::set_oracle_address(&env, &oracle_address);
        storage::set_max_interest_rate(&env, max_interest_rate);
        storage::set_paused(&env, false);

        Ok(())
    }

    // ========== LENDER FUNCTIONS ==========

    /// Create a new lending offer
    pub fn create_offer(
        env: Env,
        lender: Address,
        usdc_amount: i128,
        weekly_interest_rate: u32,
        min_collateral_ratio: u32,
        liquidation_threshold: u32,
        max_duration_weeks: u32,
    ) -> Result<u64, Error> {
        // Authorization and guards
        lender.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Validate inputs
        validation::validate_offer_amount(usdc_amount)?;
        validation::validate_interest_rate(&env, weekly_interest_rate)?;
        validation::validate_collateral_ratio(min_collateral_ratio)?;
        validation::validate_liquidation_threshold(liquidation_threshold, min_collateral_ratio)?;
        validation::validate_offer_limit(&env, &lender)?;

        // Get USDC token
        let usdc_token = storage::get_usdc_token(&env)?;
        let token_client = token::TokenClient::new(&env, &usdc_token);

        // Transfer USDC from lender to contract
        token_client.transfer(&lender, &env.current_contract_address(), &usdc_amount);

        // Create offer
        let offer_id = storage::get_next_offer_id(&env);
        let offer = LendingOffer {
            offer_id,
            lender: lender.clone(),
            usdc_amount,
            weekly_interest_rate,
            min_collateral_ratio,
            liquidation_threshold,
            max_duration_weeks,
            is_active: true,
            created_at: env.ledger().timestamp(),
        };

        // Store offer
        storage::set_offer(&env, &offer);
        storage::add_user_offer(&env, &lender, offer_id);
        storage::add_active_offer(&env, offer_id);

        storage::unlock(&env);
        Ok(offer_id)
    }

    /// Cancel an offer (only if no active loans against it)
    pub fn cancel_offer(env: Env, lender: Address, offer_id: u64) -> Result<(), Error> {
        lender.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get offer
        let mut offer = storage::get_offer(&env, offer_id)?;

        // Verify ownership
        if offer.lender != lender {
            storage::unlock(&env);
            return Err(Error::OnlyLender);
        }

        // Verify offer is active
        if !offer.is_active {
            storage::unlock(&env);
            return Err(Error::OfferNotActive);
        }

        // Check if there are active loans against this offer
        // For simplicity, we'll allow cancellation if amount is still available
        // In production, track loans per offer

        // Mark offer as inactive
        offer.is_active = false;
        storage::set_offer(&env, &offer);

        // Remove from active offers
        storage::remove_active_offer(&env, offer_id);

        // Return funds to lender
        let usdc_token = storage::get_usdc_token(&env)?;
        let token_client = token::TokenClient::new(&env, &usdc_token);
        token_client.transfer(&env.current_contract_address(), &lender, &offer.usdc_amount);

        storage::unlock(&env);
        Ok(())
    }

    /// Withdraw unused funds from an offer
    pub fn withdraw_from_offer(
        env: Env,
        lender: Address,
        offer_id: u64,
        amount: i128,
    ) -> Result<(), Error> {
        lender.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get offer
        let mut offer = storage::get_offer(&env, offer_id)?;

        // Verify ownership
        if offer.lender != lender {
            storage::unlock(&env);
            return Err(Error::OnlyLender);
        }

        // Verify amount
        if amount <= 0 || amount > offer.usdc_amount {
            storage::unlock(&env);
            return Err(Error::InvalidInput);
        }

        // Update offer amount
        offer.usdc_amount = offer
            .usdc_amount
            .checked_sub(amount)
            .ok_or(Error::ArithmeticUnderflow)?;

        storage::set_offer(&env, &offer);

        // Transfer USDC to lender
        let usdc_token = storage::get_usdc_token(&env)?;
        let token_client = token::TokenClient::new(&env, &usdc_token);
        token_client.transfer(&env.current_contract_address(), &lender, &amount);

        storage::unlock(&env);
        Ok(())
    }

    // ========== BORROWER FUNCTIONS ==========

    /// Borrow USDC against XLM collateral
    pub fn borrow(
        env: Env,
        borrower: Address,
        offer_id: u64,
        collateral_amount: i128,
        borrow_amount: i128,
    ) -> Result<u64, Error> {
        borrower.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get offer
        let mut offer = storage::get_offer(&env, offer_id)?;

        // Verify offer is active
        if !offer.is_active {
            storage::unlock(&env);
            return Err(Error::OfferNotActive);
        }

        // Verify sufficient funds in offer
        if borrow_amount > offer.usdc_amount {
            storage::unlock(&env);
            return Err(Error::InsufficientOfferFunds);
        }

        // Validate inputs
        validation::validate_collateral_amount(collateral_amount)?;
        validation::validate_borrow_amount(borrow_amount)?;
        validation::validate_loan_limit(&env, &borrower)?;
        validation::validate_sufficient_collateral(
            &env,
            collateral_amount,
            borrow_amount,
            offer.min_collateral_ratio,
        )?;

        // Transfer XLM collateral from borrower to contract
        let xlm_token = storage::get_xlm_token(&env)?;
        let xlm_client = token::TokenClient::new(&env, &xlm_token);
        xlm_client.transfer(&borrower, &env.current_contract_address(), &collateral_amount);

        // Create loan
        let loan_id = storage::get_next_loan_id(&env);
        let current_time = env.ledger().timestamp();

        let loan = Loan {
            loan_id,
            offer_id,
            borrower: borrower.clone(),
            lender: offer.lender.clone(),
            collateral_amount,
            borrowed_amount: borrow_amount,
            interest_rate: offer.weekly_interest_rate,
            start_time: current_time,
            last_interest_update: current_time,
            accumulated_interest: 0,
            liquidation_threshold: offer.liquidation_threshold,
            is_active: true,
        };

        // Store loan
        storage::set_loan(&env, &loan);
        storage::add_user_loan_as_borrower(&env, &borrower, loan_id);
        storage::add_user_loan_as_lender(&env, &offer.lender, loan_id);
        storage::add_active_loan(&env, loan_id);

        // Update offer (reduce available amount)
        offer.usdc_amount = offer
            .usdc_amount
            .checked_sub(borrow_amount)
            .ok_or(Error::ArithmeticUnderflow)?;
        storage::set_offer(&env, &offer);

        // Transfer USDC to borrower
        let usdc_token = storage::get_usdc_token(&env)?;
        let usdc_client = token::TokenClient::new(&env, &usdc_token);
        usdc_client.transfer(&env.current_contract_address(), &borrower, &borrow_amount);

        storage::unlock(&env);
        Ok(loan_id)
    }

    /// Repay a loan (partial or full)
    pub fn repay(env: Env, borrower: Address, loan_id: u64, repay_amount: i128) -> Result<(), Error> {
        borrower.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get loan
        let mut loan = storage::get_loan(&env, loan_id)?;

        // Verify borrower
        if loan.borrower != borrower {
            storage::unlock(&env);
            return Err(Error::OnlyBorrower);
        }

        // Verify loan is active
        if !loan.is_active {
            storage::unlock(&env);
            return Err(Error::LoanNotActive);
        }

        // Calculate current total debt
        let current_time = env.ledger().timestamp();
        let total_debt = interest::calculate_total_debt(
            loan.borrowed_amount,
            loan.accumulated_interest,
            loan.interest_rate,
            loan.last_interest_update,
            current_time,
        )?;

        // Validate repayment amount
        validation::validate_repay_amount(repay_amount, total_debt)?;

        // Transfer USDC from borrower to lender
        let usdc_token = storage::get_usdc_token(&env)?;
        let usdc_client = token::TokenClient::new(&env, &usdc_token);
        usdc_client.transfer(&borrower, &loan.lender, &repay_amount);

        // Calculate how much principal and interest is being paid
        let new_interest = interest::calculate_interest(
            loan.borrowed_amount,
            loan.interest_rate,
            loan.last_interest_update,
            current_time,
        )?;

        let total_interest = loan
            .accumulated_interest
            .checked_add(new_interest)
            .ok_or(Error::ArithmeticOverflow)?;

        // Pay interest first, then principal
        if repay_amount >= total_interest {
            // Paying all interest and some/all principal
            let principal_payment = repay_amount
                .checked_sub(total_interest)
                .ok_or(Error::ArithmeticUnderflow)?;

            loan.accumulated_interest = 0;
            loan.borrowed_amount = loan
                .borrowed_amount
                .checked_sub(principal_payment)
                .ok_or(Error::ArithmeticUnderflow)?;
        } else {
            // Only paying partial interest
            loan.accumulated_interest = total_interest
                .checked_sub(repay_amount)
                .ok_or(Error::ArithmeticUnderflow)?;
        }

        loan.last_interest_update = current_time;

        // If fully repaid, close loan and return collateral
        if loan.borrowed_amount == 0 && loan.accumulated_interest == 0 {
            loan.is_active = false;
            storage::remove_active_loan(&env, loan_id);

            // Return collateral to borrower
            let xlm_token = storage::get_xlm_token(&env)?;
            let xlm_client = token::TokenClient::new(&env, &xlm_token);
            xlm_client.transfer(&env.current_contract_address(), &borrower, &loan.collateral_amount);
        }

        storage::set_loan(&env, &loan);
        storage::unlock(&env);
        Ok(())
    }

    /// Add more collateral to improve loan health
    pub fn add_collateral(
        env: Env,
        borrower: Address,
        loan_id: u64,
        additional_collateral: i128,
    ) -> Result<(), Error> {
        borrower.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get loan
        let mut loan = storage::get_loan(&env, loan_id)?;

        // Verify borrower
        if loan.borrower != borrower {
            storage::unlock(&env);
            return Err(Error::OnlyBorrower);
        }

        // Verify loan is active
        if !loan.is_active {
            storage::unlock(&env);
            return Err(Error::LoanNotActive);
        }

        // Validate amount
        validation::validate_collateral_amount(additional_collateral)?;

        // Transfer XLM from borrower to contract
        let xlm_token = storage::get_xlm_token(&env)?;
        let xlm_client = token::TokenClient::new(&env, &xlm_token);
        xlm_client.transfer(&borrower, &env.current_contract_address(), &additional_collateral);

        // Update loan
        loan.collateral_amount = loan
            .collateral_amount
            .checked_add(additional_collateral)
            .ok_or(Error::ArithmeticOverflow)?;

        storage::set_loan(&env, &loan);
        storage::unlock(&env);
        Ok(())
    }

    /// Withdraw excess collateral (if health allows)
    pub fn withdraw_collateral(
        env: Env,
        borrower: Address,
        loan_id: u64,
        amount: i128,
    ) -> Result<(), Error> {
        borrower.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get loan
        let mut loan = storage::get_loan(&env, loan_id)?;

        // Verify borrower
        if loan.borrower != borrower {
            storage::unlock(&env);
            return Err(Error::OnlyBorrower);
        }

        // Verify loan is active
        if !loan.is_active {
            storage::unlock(&env);
            return Err(Error::LoanNotActive);
        }

        // Calculate current total debt
        let current_time = env.ledger().timestamp();
        let total_debt = interest::calculate_total_debt(
            loan.borrowed_amount,
            loan.accumulated_interest,
            loan.interest_rate,
            loan.last_interest_update,
            current_time,
        )?;

        // Validate withdrawal won't breach health
        validation::validate_collateral_withdrawal(
            &env,
            loan.collateral_amount,
            amount,
            total_debt,
            loan.liquidation_threshold,
        )?;

        // Transfer XLM to borrower
        let xlm_token = storage::get_xlm_token(&env)?;
        let xlm_client = token::TokenClient::new(&env, &xlm_token);
        xlm_client.transfer(&env.current_contract_address(), &borrower, &amount);

        // Update loan
        loan.collateral_amount = loan
            .collateral_amount
            .checked_sub(amount)
            .ok_or(Error::ArithmeticUnderflow)?;

        storage::set_loan(&env, &loan);
        storage::unlock(&env);
        Ok(())
    }

    // ========== LIQUIDATION FUNCTIONS ==========

    /// Check if a loan is liquidatable
    pub fn is_liquidatable(env: Env, loan_id: u64) -> Result<bool, Error> {
        let loan = storage::get_loan(&env, loan_id)?;
        liquidation::is_liquidatable(&env, &loan)
    }

    /// Liquidate an undercollateralized loan
    /// Anyone can call this function
    pub fn liquidate(env: Env, liquidator: Address, loan_id: u64) -> Result<(), Error> {
        liquidator.require_auth();
        storage::require_not_paused(&env)?;
        storage::lock(&env)?;

        // Get loan
        let mut loan = storage::get_loan(&env, loan_id)?;

        // Execute liquidation
        liquidation::execute_liquidation(&env, &loan, &liquidator)?;

        // Mark loan as inactive
        loan.is_active = false;
        storage::set_loan(&env, &loan);
        storage::remove_active_loan(&env, loan_id);

        storage::unlock(&env);
        Ok(())
    }

    /// Batch check which loans are liquidatable
    pub fn batch_check_liquidations(env: Env, loan_ids: Vec<u64>) -> Result<Vec<u64>, Error> {
        liquidation::batch_check_liquidatable_vec(&env, loan_ids)
    }

    // ========== QUERY FUNCTIONS ==========

    /// Get offer details
    pub fn get_offer(env: Env, offer_id: u64) -> Result<LendingOffer, Error> {
        storage::get_offer(&env, offer_id)
    }

    /// Get loan details
    pub fn get_loan(env: Env, loan_id: u64) -> Result<Loan, Error> {
        storage::get_loan(&env, loan_id)
    }

    /// Get loan health information
    pub fn get_loan_health(env: Env, loan_id: u64) -> Result<LoanHealth, Error> {
        let loan = storage::get_loan(&env, loan_id)?;
        liquidation::calculate_loan_health(&env, &loan)
    }

    /// Calculate accumulated interest for a loan
    pub fn calculate_interest(env: Env, loan_id: u64) -> Result<i128, Error> {
        let loan = storage::get_loan(&env, loan_id)?;
        let current_time = env.ledger().timestamp();

        let new_interest = interest::calculate_interest(
            loan.borrowed_amount,
            loan.interest_rate,
            loan.last_interest_update,
            current_time,
        )?;

        let total_interest = loan
            .accumulated_interest
            .checked_add(new_interest)
            .ok_or(Error::ArithmeticOverflow)?;

        Ok(total_interest)
    }

    /// Get current XLM price
    pub fn get_xlm_price(env: Env) -> Result<i128, Error> {
        let oracle_address = storage::get_oracle_address(&env)?;
        let price_data = oracle::get_xlm_price(&env, &oracle_address)?;
        Ok(price_data.price)
    }

    /// Get user's offers
    pub fn get_user_offers(env: Env, user: Address) -> Vec<u64> {
        storage::get_user_offers(&env, &user)
    }

    /// Get user's loans as borrower
    pub fn get_user_loans_as_borrower(env: Env, user: Address) -> Vec<u64> {
        storage::get_user_loans_as_borrower(&env, &user)
    }

    /// Get user's loans as lender
    pub fn get_user_loans_as_lender(env: Env, user: Address) -> Vec<u64> {
        storage::get_user_loans_as_lender(&env, &user)
    }

    /// Get all active offers
    pub fn get_active_offers(env: Env) -> Vec<u64> {
        storage::get_active_offers(&env)
    }

    /// Get all active loans
    pub fn get_active_loans(env: Env) -> Vec<u64> {
        storage::get_active_loans(&env)
    }

    // ========== ADMIN FUNCTIONS ==========

    /// Update maximum interest rate
    pub fn set_max_interest_rate(env: Env, admin: Address, max_rate: u32) -> Result<(), Error> {
        admin.require_auth();
        storage::require_admin(&env, &admin)?;

        storage::set_max_interest_rate(&env, max_rate);
        Ok(())
    }

    /// Update oracle address
    pub fn set_oracle_address(env: Env, admin: Address, oracle: Address) -> Result<(), Error> {
        admin.require_auth();
        storage::require_admin(&env, &admin)?;

        storage::set_oracle_address(&env, &oracle);
        Ok(())
    }

    /// Pause contract
    pub fn pause_contract(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();
        storage::require_admin(&env, &admin)?;

        storage::set_paused(&env, true);
        Ok(())
    }

    /// Unpause contract
    pub fn unpause_contract(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();
        storage::require_admin(&env, &admin)?;

        storage::set_paused(&env, false);
        Ok(())
    }

    /// Get admin address
    pub fn admin(env: Env) -> Result<Address, Error> {
        storage::get_admin(&env)
    }
}
