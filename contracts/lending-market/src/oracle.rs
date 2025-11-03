//! Price oracle wrapper with validation and safety checks

use crate::error::Error;
use crate::reflector::{Asset as ReflectorAsset, PriceData, ReflectorClient};
use crate::types::PRICE_STALENESS_THRESHOLD;
use soroban_sdk::{Address, Env};

/// Get XLM price in USDC from Reflector oracle with validation
pub fn get_xlm_price(env: &Env, oracle_address: &Address) -> Result<PriceData, Error> {
    // Create Reflector client
    let client = ReflectorClient::new(env, oracle_address);

    // XLM is the native asset - we need to get its stellar address
    // For XLM, we use a special identifier or the contract can accept it as parameter
    // In testnet, XLM stellar asset would be represented by its address
    // For now, we'll use a placeholder that needs to be configured
    // In production, this should be the actual XLM asset address

    // Note: The actual XLM asset address should be stored in contract storage
    // and set during initialization. For now, we'll create a generic approach.
    let xlm_asset = ReflectorAsset::Other(soroban_sdk::symbol_short!("XLM"));

    // Fetch the most recent price
    let price_data = client
        .lastprice(&xlm_asset)
        .ok_or(Error::PriceNotAvailable)?;

    // Validate price is not stale
    let current_time = env.ledger().timestamp();
    if current_time - price_data.timestamp > PRICE_STALENESS_THRESHOLD {
        return Err(Error::StalePriceData);
    }

    // Validate price is positive
    if price_data.price <= 0 {
        return Err(Error::InvalidPriceData);
    }

    // Additional sanity check: XLM price should be between $0.01 and $100
    // Oracle uses 14 decimals typically, so $0.01 = 10^12, $100 = 10^16
    // Adjust these based on actual oracle decimals
    let decimals = client.decimals();
    let min_price = 10_i128.pow(decimals - 2); // $0.01
    let max_price = 100 * 10_i128.pow(decimals); // $100

    if price_data.price < min_price || price_data.price > max_price {
        return Err(Error::InvalidPriceData);
    }

    Ok(price_data)
}

/// Get oracle decimals
pub fn get_oracle_decimals(env: &Env, oracle_address: &Address) -> u32 {
    let client = ReflectorClient::new(env, oracle_address);
    client.decimals()
}

/// Calculate USD value of XLM amount
pub fn xlm_to_usdc_value(
    env: &Env,
    oracle_address: &Address,
    xlm_amount: i128,
) -> Result<i128, Error> {
    let price_data = get_xlm_price(env, oracle_address)?;
    let decimals = get_oracle_decimals(env, oracle_address);

    // USDC value = (xlm_amount * price) / 10^decimals
    // Need to handle potential overflow
    let value = xlm_amount
        .checked_mul(price_data.price)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(10_i128.pow(decimals))
        .ok_or(Error::DivisionByZero)?;

    Ok(value)
}

/// Calculate XLM amount needed for specific USD value
pub fn usdc_to_xlm_amount(
    env: &Env,
    oracle_address: &Address,
    usdc_amount: i128,
) -> Result<i128, Error> {
    let price_data = get_xlm_price(env, oracle_address)?;
    let decimals = get_oracle_decimals(env, oracle_address);

    // XLM amount = (usdc_amount * 10^decimals) / price
    let amount = usdc_amount
        .checked_mul(10_i128.pow(decimals))
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(price_data.price)
        .ok_or(Error::DivisionByZero)?;

    Ok(amount)
}

/// Calculate the liquidation price for a loan
/// This is the XLM price at which the loan becomes liquidatable
pub fn calculate_liquidation_price(
    total_debt: i128,
    collateral_amount: i128,
    liquidation_threshold: u32,
    oracle_decimals: u32,
) -> Result<i128, Error> {
    // liquidation_price = (total_debt * liquidation_threshold * 10^decimals) / (collateral_amount * 10000)
    // At this price, collateral_value / total_debt = liquidation_threshold / 10000

    let liquidation_price = total_debt
        .checked_mul(liquidation_threshold as i128)
        .ok_or(Error::ArithmeticOverflow)?
        .checked_mul(10_i128.pow(oracle_decimals))
        .ok_or(Error::ArithmeticOverflow)?
        .checked_div(collateral_amount)
        .ok_or(Error::DivisionByZero)?
        .checked_div(10000)
        .ok_or(Error::DivisionByZero)?;

    Ok(liquidation_price)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_liquidation_price_calculation() {
        // Test case:
        // Debt: 50 USDC (50_0000000 with 7 decimals)
        // Collateral: 100 XLM (100_0000000 with 7 decimals)
        // Liquidation threshold: 125% (12500 basis points)
        // Oracle decimals: 14

        let total_debt = 50_0000000_i128;
        let collateral_amount = 100_0000000_i128;
        let liquidation_threshold = 12500_u32;
        let oracle_decimals = 14_u32;

        let result = calculate_liquidation_price(
            total_debt,
            collateral_amount,
            liquidation_threshold,
            oracle_decimals,
        );

        assert!(result.is_ok());

        // Expected liquidation price = (50 * 12500 * 10^14) / (100 * 10000)
        // = 625000 * 10^14 / 1000000
        // = 62500000000000000
        // This represents $0.625 with 14 decimals
        let expected = 62500000000000000_i128;
        assert_eq!(result.unwrap(), expected);
    }
}
