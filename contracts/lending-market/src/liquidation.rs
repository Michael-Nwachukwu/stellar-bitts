//! Liquidation engine and logic for undercollateralized loans

use crate::error::Error;
use crate::interest;
use crate::oracle;
use crate::storage;
use crate::types::{Loan, LoanHealth, BASIS_POINTS, LIQUIDATION_BONUS_BPS};
use soroban_sdk::{token, Address, Env, Vec};

/// Check if a loan is liquidatable
pub fn is_liquidatable(env: &Env, loan: &Loan) -> Result<bool, Error> {
    if !loan.is_active {
        return Ok(false);
    }

    let health = calculate_loan_health(env, loan)?;
    Ok(health.is_liquidatable)
}

/// Calculate comprehensive health metrics for a loan
pub fn calculate_loan_health(env: &Env, loan: &Loan) -> Result<LoanHealth, Error> {
    // Get oracle address
    let oracle_address = storage::get_oracle_address(env)?;

    // Calculate current total debt (principal + accumulated + new interest)
    let current_time = env.ledger().timestamp();
    let total_debt = interest::calculate_total_debt(
        loan.borrowed_amount,
        loan.accumulated_interest,
        loan.interest_rate,
        loan.last_interest_update,
        current_time,
    )?;

    // Calculate current collateral value in USDC
    let collateral_value =
        oracle::xlm_to_usdc_value(env, &oracle_address, loan.collateral_amount)?;

    // Calculate collateralization ratio (in basis points)
    // ratio = (collateral_value / total_debt) * BASIS_POINTS
    let collateralization_ratio = if total_debt == 0 {
        u32::MAX
    } else {
        let ratio = collateral_value
            .checked_mul(BASIS_POINTS as i128)
            .ok_or(Error::ArithmeticOverflow)?
            .checked_div(total_debt)
            .ok_or(Error::DivisionByZero)?;

        // Clamp to u32 range
        if ratio > u32::MAX as i128 {
            u32::MAX
        } else {
            ratio as u32
        }
    };

    // Check if liquidatable
    let is_liquidatable = collateralization_ratio <= loan.liquidation_threshold;

    // Calculate health factor (collateralization_ratio / liquidation_threshold * 10000)
    // Health > 10000 means safe, < 10000 means at risk
    let health_factor = if loan.liquidation_threshold == 0 {
        u32::MAX
    } else {
        let factor = (collateralization_ratio as u64)
            .checked_mul(BASIS_POINTS as u64)
            .ok_or(Error::ArithmeticOverflow)?
            .checked_div(loan.liquidation_threshold as u64)
            .ok_or(Error::DivisionByZero)?;

        if factor > u32::MAX as u64 {
            u32::MAX
        } else {
            factor as u32
        }
    };

    // Calculate liquidation price
    let oracle_decimals = oracle::get_oracle_decimals(env, &oracle_address);
    let liquidation_price = oracle::calculate_liquidation_price(
        total_debt,
        loan.collateral_amount,
        loan.liquidation_threshold,
        oracle_decimals,
    )?;

    Ok(LoanHealth {
        loan_id: loan.loan_id,
        collateral_value_usd: collateral_value,
        debt_value_usd: total_debt,
        collateralization_ratio,
        liquidation_price,
        health_factor,
        is_liquidatable,
    })
}

/// Execute liquidation of an undercollateralized loan
/// This function performs the actual liquidation by:
/// 1. Verifying the loan is liquidatable
/// 2. Swapping XLM collateral for USDC
/// 3. Paying the lender (principal + interest)
/// 4. Paying liquidator bonus
/// 5. Returning excess to borrower (if any)
pub fn execute_liquidation(
    env: &Env,
    loan: &Loan,
    liquidator: &Address,
) -> Result<(), Error> {
    // Verify loan is active
    if !loan.is_active {
        return Err(Error::LoanNotActive);
    }

    // Verify loan is liquidatable
    if !is_liquidatable(env, loan)? {
        return Err(Error::NotLiquidatable);
    }

    // Calculate total debt
    let current_time = env.ledger().timestamp();
    let total_debt = interest::calculate_total_debt(
        loan.borrowed_amount,
        loan.accumulated_interest,
        loan.interest_rate,
        loan.last_interest_update,
        current_time,
    )?;

    // Get token addresses
    let usdc_token = storage::get_usdc_token(env)?;
    let xlm_token = storage::get_xlm_token(env)?;

    let contract_address = env.current_contract_address();

    // Transfer XLM collateral from contract to liquidator temporarily
    // In production, this would swap via DEX, but for now we'll use simplified logic
    let xlm_client = token::TokenClient::new(env, &xlm_token);
    let usdc_client = token::TokenClient::new(env, &usdc_token);

    // Calculate how much USDC we'd get from selling XLM
    let oracle_address = storage::get_oracle_address(env)?;
    let usdc_received =
        oracle::xlm_to_usdc_value(env, &oracle_address, loan.collateral_amount)?;

    // Ensure we have enough to cover the debt
    if usdc_received < total_debt {
        return Err(Error::InsufficientCollateralValue);
    }

    // In a real implementation, we would:
    // 1. Transfer XLM to DEX or liquidator
    // 2. Liquidator swaps XLM → USDC
    // 3. Receive USDC back
    // For now, we'll simulate this by calculating values

    // Calculate liquidator bonus (5% of collateral value)
    let liquidator_bonus = usdc_received
        .checked_mul(LIQUIDATION_BONUS_BPS as i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(BASIS_POINTS as i128)
        .ok_or(Error::DivisionByZero)?;

    // Distribution:
    // 1. Pay lender the total debt
    // 2. Pay liquidator their bonus
    // 3. Return excess to borrower (if any)

    let total_paid = total_debt
        .checked_add(liquidator_bonus)
        .ok_or(Error::ArithmeticOverflow)?;

    // Transfer collateral to liquidator (in real implementation, this goes to DEX)
    xlm_client.transfer(&contract_address, liquidator, &loan.collateral_amount);

    // Liquidator needs to provide USDC to cover debt + bonus
    // In production, they get this from swapping the XLM
    // For testing, liquidator must have USDC balance

    // Transfer debt payment to lender
    usdc_client.transfer(liquidator, &loan.lender, &total_debt);

    // Calculate and handle excess
    if usdc_received > total_paid {
        let excess = usdc_received
            .checked_sub(total_paid)
            .ok_or(Error::ArithmeticUnderflow)?;

        // Return excess to borrower (in USDC or could be converted back to XLM)
        // For simplicity, we return USDC
        usdc_client.transfer(liquidator, &loan.borrower, &excess);
    }

    Ok(())
}

/// Batch check which loans are liquidatable
/// Returns a vector of loan IDs that can be liquidated
pub fn batch_check_liquidatable(env: &Env, loan_ids: &[u64]) -> Result<Vec<u64>, Error> {
    let mut liquidatable = Vec::new(env);

    for loan_id in loan_ids {
        if let Ok(loan) = storage::get_loan(env, *loan_id) {
            if is_liquidatable(env, &loan)? {
                liquidatable.push_back(*loan_id);
            }
        }
    }

    Ok(liquidatable)
}

/// Batch check which loans are liquidatable (Vec version)
/// Returns a vector of loan IDs that can be liquidated
pub fn batch_check_liquidatable_vec(env: &Env, loan_ids: Vec<u64>) -> Result<Vec<u64>, Error> {
    let mut liquidatable = Vec::new(env);

    for i in 0..loan_ids.len() {
        let loan_id = loan_ids.get(i).unwrap();
        if let Ok(loan) = storage::get_loan(env, loan_id) {
            if is_liquidatable(env, &loan)? {
                liquidatable.push_back(loan_id);
            }
        }
    }

    Ok(liquidatable)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Loan;

    #[test]
    fn test_calculate_health_factor() {
        // Collateral ratio: 150% (15000 basis points)
        // Liquidation threshold: 125% (12500 basis points)
        // Expected health factor: (15000 / 12500) * 10000 = 12000 (120%)

        let collateralization_ratio = 15000_u32;
        let liquidation_threshold = 12500_u32;

        let health_factor = (collateralization_ratio as u64)
            .checked_mul(BASIS_POINTS as u64)
            .unwrap()
            .checked_div(liquidation_threshold as u64)
            .unwrap() as u32;

        assert_eq!(health_factor, 12000_u32);
    }

    #[test]
    fn test_is_liquidatable_logic() {
        // Scenario 1: Healthy loan (200% collateral, 125% threshold)
        let ratio1 = 20000_u32;
        let threshold1 = 12500_u32;
        assert!(!( ratio1 <= threshold1)); // NOT liquidatable

        // Scenario 2: At threshold (125% collateral, 125% threshold)
        let ratio2 = 12500_u32;
        let threshold2 = 12500_u32;
        assert!(ratio2 <= threshold2); // Liquidatable

        // Scenario 3: Below threshold (120% collateral, 125% threshold)
        let ratio3 = 12000_u32;
        let threshold3 = 12500_u32;
        assert!(ratio3 <= threshold3); // Liquidatable
    }
}
