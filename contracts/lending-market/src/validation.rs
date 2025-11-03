//! Input validation and guard functions

use crate::error::Error;
use crate::oracle;
use crate::storage;
use crate::types::{BASIS_POINTS, MAX_LOANS_PER_USER, MAX_OFFERS_PER_USER};
use soroban_sdk::{Address, Env};

/// Validate interest rate is within allowed range
pub fn validate_interest_rate(env: &Env, rate: u32) -> Result<(), Error> {
    if rate == 0 {
        return Err(Error::InvalidInterestRate);
    }

    let max_rate = storage::get_max_interest_rate(env);
    if rate > max_rate {
        return Err(Error::InvalidInterestRate);
    }

    Ok(())
}

/// Validate collateral ratio is reasonable
/// Should be at least 100% (10000 basis points) and typically 150-300%
pub fn validate_collateral_ratio(ratio: u32) -> Result<(), Error> {
    if ratio < BASIS_POINTS {
        // Minimum 100% collateral
        return Err(Error::InvalidCollateralRatio);
    }

    if ratio > 50000 {
        // Maximum 500% (probably misconfigured)
        return Err(Error::InvalidCollateralRatio);
    }

    Ok(())
}

/// Validate liquidation threshold
/// Should be less than collateral ratio and at least 100%
pub fn validate_liquidation_threshold(
    threshold: u32,
    min_collateral_ratio: u32,
) -> Result<(), Error> {
    if threshold < BASIS_POINTS {
        // Must be at least 100%
        return Err(Error::InvalidLiquidationThreshold);
    }

    if threshold >= min_collateral_ratio {
        // Liquidation threshold must be less than minimum collateral ratio
        return Err(Error::InvalidLiquidationThreshold);
    }

    Ok(())
}

/// Validate offer amount is positive
pub fn validate_offer_amount(amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidOfferAmount);
    }

    Ok(())
}

/// Validate borrow amount is positive
pub fn validate_borrow_amount(amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidBorrowAmount);
    }

    Ok(())
}

/// Validate collateral amount is positive
pub fn validate_collateral_amount(amount: i128) -> Result<(), Error> {
    if amount <= 0 {
        return Err(Error::InvalidCollateralAmount);
    }

    Ok(())
}

/// Validate user doesn't have too many offers
pub fn validate_offer_limit(env: &Env, user: &Address) -> Result<(), Error> {
    let user_offers = storage::get_user_offers(env, user);
    if user_offers.len() >= MAX_OFFERS_PER_USER {
        return Err(Error::TooManyOffers);
    }

    Ok(())
}

/// Validate user doesn't have too many loans
pub fn validate_loan_limit(env: &Env, user: &Address) -> Result<(), Error> {
    let user_loans = storage::get_user_loans_as_borrower(env, user);
    if user_loans.len() >= MAX_LOANS_PER_USER {
        return Err(Error::TooManyLoans);
    }

    Ok(())
}

/// Validate borrower has sufficient collateral for requested amount
pub fn validate_sufficient_collateral(
    env: &Env,
    collateral_amount: i128,
    borrow_amount: i128,
    min_collateral_ratio: u32,
) -> Result<(), Error> {
    // Get oracle address
    let oracle_address = storage::get_oracle_address(env)?;

    // Calculate collateral value in USDC
    let collateral_value = oracle::xlm_to_usdc_value(env, &oracle_address, collateral_amount)?;

    // Calculate maximum borrowable amount
    // max_borrow = (collateral_value * BASIS_POINTS) / min_collateral_ratio
    let max_borrow = collateral_value
        .checked_mul(BASIS_POINTS as i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(min_collateral_ratio as i128)
        .ok_or(Error::DivisionByZero)?;

    if borrow_amount > max_borrow {
        return Err(Error::InsufficientCollateral);
    }

    Ok(())
}

/// Validate repayment amount
pub fn validate_repay_amount(repay_amount: i128, total_debt: i128) -> Result<(), Error> {
    if repay_amount <= 0 {
        return Err(Error::InvalidRepayAmount);
    }

    if repay_amount > total_debt {
        return Err(Error::RepayExceedsDebt);
    }

    Ok(())
}

/// Validate loan duration is within allowed range
pub fn validate_loan_duration(duration_weeks: u32, max_duration: u32) -> Result<(), Error> {
    if duration_weeks == 0 {
        return Err(Error::InvalidInput);
    }

    if duration_weeks > max_duration {
        return Err(Error::LoanDurationExceeded);
    }

    Ok(())
}

/// Validate collateral withdrawal won't breach health threshold
pub fn validate_collateral_withdrawal(
    env: &Env,
    current_collateral: i128,
    withdrawal_amount: i128,
    total_debt: i128,
    liquidation_threshold: u32,
) -> Result<(), Error> {
    if withdrawal_amount <= 0 {
        return Err(Error::InvalidInput);
    }

    if withdrawal_amount > current_collateral {
        return Err(Error::InvalidInput);
    }

    let new_collateral = current_collateral
        .checked_sub(withdrawal_amount)
        .ok_or(Error::ArithmeticUnderflow)?;

    // Get oracle address
    let oracle_address = storage::get_oracle_address(env)?;

    // Calculate new collateral value
    let new_collateral_value = oracle::xlm_to_usdc_value(env, &oracle_address, new_collateral)?;

    // Calculate new collateralization ratio
    let new_ratio = new_collateral_value
        .checked_mul(BASIS_POINTS as i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(total_debt)
        .ok_or(Error::DivisionByZero)?;

    // Ensure new ratio is above liquidation threshold with a safety margin
    // We require at least 150% health to allow withdrawal
    let min_safe_ratio = liquidation_threshold
        .checked_add(2500) // Add 25% safety margin
        .ok_or(Error::ArithmeticOverflow)?;

    if (new_ratio as u32) < min_safe_ratio {
        return Err(Error::WithdrawalBreachesHealth);
    }

    Ok(())
}

/// Validate pagination parameters
pub fn validate_pagination(limit: u32, offset: u32) -> Result<(), Error> {
    if limit == 0 || limit > 100 {
        return Err(Error::InvalidPagination);
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_interest_rate() {
        let env = Env::default();

        // Set max rate to 3000 (30%)
        storage::set_max_interest_rate(&env, 3000);

        // Valid rates
        assert!(validate_interest_rate(&env, 100).is_ok()); // 1%
        assert!(validate_interest_rate(&env, 500).is_ok()); // 5%
        assert!(validate_interest_rate(&env, 3000).is_ok()); // 30%

        // Invalid rates
        assert!(validate_interest_rate(&env, 0).is_err()); // 0%
        assert!(validate_interest_rate(&env, 3001).is_err()); // 30.01%
    }

    #[test]
    fn test_validate_collateral_ratio() {
        // Valid ratios
        assert!(validate_collateral_ratio(10000).is_ok()); // 100%
        assert!(validate_collateral_ratio(15000).is_ok()); // 150%
        assert!(validate_collateral_ratio(20000).is_ok()); // 200%
        assert!(validate_collateral_ratio(30000).is_ok()); // 300%

        // Invalid ratios
        assert!(validate_collateral_ratio(9999).is_err()); // < 100%
        assert!(validate_collateral_ratio(50001).is_err()); // > 500%
    }

    #[test]
    fn test_validate_liquidation_threshold() {
        // Valid thresholds
        assert!(validate_liquidation_threshold(12500, 20000).is_ok()); // 125% threshold, 200% ratio
        assert!(validate_liquidation_threshold(13000, 15000).is_ok()); // 130% threshold, 150% ratio

        // Invalid thresholds
        assert!(validate_liquidation_threshold(9999, 20000).is_err()); // < 100%
        assert!(validate_liquidation_threshold(20000, 20000).is_err()); // >= collateral ratio
        assert!(validate_liquidation_threshold(25000, 20000).is_err()); // > collateral ratio
    }
}
