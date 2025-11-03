//! Interest calculation logic for loans

use crate::error::Error;
use crate::types::{BASIS_POINTS, SECONDS_PER_WEEK};

/// Calculate accumulated interest using simple per-second interest
///
/// Formula: interest = principal × (rate / BASIS_POINTS) × (seconds_elapsed / SECONDS_PER_WEEK)
///
/// # Arguments
/// * `principal` - The principal amount borrowed (USDC with 7 decimals)
/// * `weekly_interest_rate` - Interest rate in basis points (e.g., 500 = 5%)
/// * `start_time` - When the loan started or when interest was last calculated
/// * `current_time` - Current timestamp
///
/// # Returns
/// * `Ok(i128)` - The accumulated interest amount
/// * `Err(Error)` - If calculation overflows
pub fn calculate_interest(
    principal: i128,
    weekly_interest_rate: u32,
    start_time: u64,
    current_time: u64,
) -> Result<i128, Error> {
    if current_time < start_time {
        return Err(Error::InvalidInput);
    }

    let seconds_elapsed = current_time - start_time;

    if seconds_elapsed == 0 {
        return Ok(0);
    }

    // Convert to i128 for calculation
    let rate_i128 = weekly_interest_rate as i128;
    let seconds_i128 = seconds_elapsed as i128;
    let seconds_per_week_i128 = SECONDS_PER_WEEK as i128;
    let basis_points_i128 = BASIS_POINTS as i128;

    // Calculate: (principal × rate × seconds_elapsed) / (BASIS_POINTS × SECONDS_PER_WEEK)
    let interest = principal
        .checked_mul(rate_i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_mul(seconds_i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(basis_points_i128)
        .ok_or(Error::DivisionByZero)?
        .checked_div(seconds_per_week_i128)
        .ok_or(Error::DivisionByZero)?;

    Ok(interest)
}

/// Calculate total debt (principal + accumulated interest + new interest)
pub fn calculate_total_debt(
    principal: i128,
    accumulated_interest: i128,
    weekly_interest_rate: u32,
    last_update: u64,
    current_time: u64,
) -> Result<i128, Error> {
    let new_interest = calculate_interest(
        principal,
        weekly_interest_rate,
        last_update,
        current_time,
    )?;

    let total_debt = principal
        .checked_add(accumulated_interest)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_add(new_interest)
        .ok_or(Error::ArithmeticOverflow)?;

    Ok(total_debt)
}

/// Calculate the APY (Annual Percentage Yield) from weekly rate
/// This is for display purposes only
pub fn calculate_apy(weekly_rate: u32) -> u32 {
    // Simple approximation: APY ≈ weekly_rate × 52
    // For compound interest: APY = (1 + rate)^52 - 1
    // We use simple calculation for gas efficiency
    weekly_rate.saturating_mul(52)
}

/// Calculate interest for a specific time period
pub fn calculate_interest_for_period(
    principal: i128,
    weekly_interest_rate: u32,
    weeks: u32,
) -> Result<i128, Error> {
    let seconds = (weeks as u64)
        .checked_mul(SECONDS_PER_WEEK)
        .ok_or(Error::ArithmeticOverflow)?;

    calculate_interest(principal, weekly_interest_rate, 0, seconds)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_interest_one_week() {
        // Principal: 100 USDC (100_0000000 with 7 decimals)
        // Rate: 5% weekly (500 basis points)
        // Time: 1 week (604800 seconds)
        // Expected interest: 5 USDC (5_0000000)

        let principal = 100_0000000_i128;
        let rate = 500_u32;
        let start_time = 0_u64;
        let current_time = SECONDS_PER_WEEK;

        let result = calculate_interest(principal, rate, start_time, current_time);

        assert!(result.is_ok());
        let interest = result.unwrap();

        // Expected: (100_0000000 × 500 × 604800) / (10000 × 604800) = 5_0000000
        assert_eq!(interest, 5_0000000_i128);
    }

    #[test]
    fn test_calculate_interest_half_week() {
        // Principal: 100 USDC
        // Rate: 5% weekly
        // Time: 0.5 week
        // Expected interest: 2.5 USDC

        let principal = 100_0000000_i128;
        let rate = 500_u32;
        let start_time = 0_u64;
        let current_time = SECONDS_PER_WEEK / 2;

        let result = calculate_interest(principal, rate, start_time, current_time);

        assert!(result.is_ok());
        let interest = result.unwrap();

        // Expected: ~2.5 USDC
        assert_eq!(interest, 2_5000000_i128);
    }

    #[test]
    fn test_calculate_interest_multiple_weeks() {
        // Principal: 100 USDC
        // Rate: 5% weekly
        // Time: 4 weeks
        // Expected interest: 20 USDC (simple interest)

        let principal = 100_0000000_i128;
        let rate = 500_u32;
        let start_time = 0_u64;
        let current_time = SECONDS_PER_WEEK * 4;

        let result = calculate_interest(principal, rate, start_time, current_time);

        assert!(result.is_ok());
        let interest = result.unwrap();

        // Expected: 20 USDC
        assert_eq!(interest, 20_0000000_i128);
    }

    #[test]
    fn test_calculate_interest_zero_time() {
        let principal = 100_0000000_i128;
        let rate = 500_u32;
        let start_time = 1000_u64;
        let current_time = 1000_u64;

        let result = calculate_interest(principal, rate, start_time, current_time);

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 0_i128);
    }

    #[test]
    fn test_calculate_interest_one_day() {
        // Principal: 100 USDC
        // Rate: 7% weekly (700 basis points)
        // Time: 1 day (86400 seconds)
        // Expected interest: 1 USDC (7% / 7 days)

        let principal = 100_0000000_i128;
        let rate = 700_u32;
        let start_time = 0_u64;
        let current_time = 86400_u64; // 1 day

        let result = calculate_interest(principal, rate, start_time, current_time);

        assert!(result.is_ok());
        let interest = result.unwrap();

        // Expected: 1 USDC
        assert_eq!(interest, 1_0000000_i128);
    }

    #[test]
    fn test_calculate_total_debt() {
        // Principal: 100 USDC
        // Accumulated interest: 5 USDC
        // Rate: 5% weekly
        // Time since last update: 1 week
        // Expected total: 110 USDC

        let principal = 100_0000000_i128;
        let accumulated = 5_0000000_i128;
        let rate = 500_u32;
        let last_update = 0_u64;
        let current_time = SECONDS_PER_WEEK;

        let result = calculate_total_debt(
            principal,
            accumulated,
            rate,
            last_update,
            current_time,
        );

        assert!(result.is_ok());
        let total = result.unwrap();

        // Expected: 100 + 5 + 5 = 110 USDC
        assert_eq!(total, 110_0000000_i128);
    }

    #[test]
    fn test_calculate_apy() {
        // 5% weekly = 260% APY (approximately)
        let weekly_rate = 500_u32;
        let apy = calculate_apy(weekly_rate);
        assert_eq!(apy, 26000_u32); // 260%

        // 1% weekly = 52% APY
        let weekly_rate = 100_u32;
        let apy = calculate_apy(weekly_rate);
        assert_eq!(apy, 5200_u32); // 52%
    }

    #[test]
    fn test_calculate_interest_for_period() {
        // Principal: 1000 USDC
        // Rate: 10% weekly
        // Period: 10 weeks
        // Expected: 1000 USDC in interest

        let principal = 1000_0000000_i128;
        let rate = 1000_u32; // 10%
        let weeks = 10_u32;

        let result = calculate_interest_for_period(principal, rate, weeks);

        assert!(result.is_ok());
        let interest = result.unwrap();

        // Expected: 1000 USDC
        assert_eq!(interest, 1000_0000000_i128);
    }
}
