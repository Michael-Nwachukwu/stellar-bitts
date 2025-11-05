#![no_std]

//! Mock Oracle Contract for Local Development
//! Implements Reflector Network SEP-40 compatible interface
//! Returns fixed XLM/USDC price of $0.15 for testing

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec};

/// Quoted asset definition (matches Reflector interface)
#[contracttype]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum Asset {
    /// For Stellar Classic and Soroban assets
    Stellar(Address),
    /// For any external currencies/tokens/assets/symbols
    Other(Symbol),
}

/// Price record definition (matches Reflector interface)
#[contracttype]
#[derive(Debug, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub struct PriceData {
    /// Asset price at given point in time
    pub price: i128,
    /// Record timestamp
    pub timestamp: u64,
}

#[contract]
pub struct MockOracle;

#[contractimpl]
impl MockOracle {
    /// Base oracle symbol the price is reported in (USDC)
    pub fn base(_env: Env) -> Asset {
        Asset::Other(Symbol::new(&_env, "USDC"))
    }

    /// All assets quoted by the contract (just XLM for now)
    pub fn assets(env: Env) -> Vec<Asset> {
        let mut assets = Vec::new(&env);
        assets.push_back(Asset::Other(Symbol::new(&env, "XLM")));
        assets
    }

    /// Number of decimal places used to represent price
    /// Reflector uses 14 decimals
    pub fn decimals(_env: Env) -> u32 {
        14
    }

    /// Quotes asset price in base asset at specific timestamp
    /// For mock: always returns same price regardless of timestamp
    pub fn price(env: Env, _asset: Asset, _timestamp: u64) -> Option<PriceData> {
        Some(PriceData {
            price: 15_000_000_000_000, // 0.15 USDC with 14 decimals = 0.15 * 10^14 = 15 trillion
            timestamp: env.ledger().timestamp(),
        })
    }

    /// Quotes the most recent price for an asset (XLM/USDC)
    /// Returns fixed price: $0.15 per XLM
    pub fn lastprice(env: Env, _asset: Asset) -> Option<PriceData> {
        Some(PriceData {
            price: 15_000_000_000_000, // 0.15 USDC with 14 decimals = 15 trillion stroops
            timestamp: env.ledger().timestamp(),
        })
    }

    /// Quotes last N price records for the given asset
    /// For mock: returns same price N times
    pub fn prices(env: Env, asset: Asset, records: u32) -> Option<Vec<PriceData>> {
        let mut prices = Vec::new(&env);
        let current_time = env.ledger().timestamp();

        for i in 0..records {
            prices.push_back(PriceData {
                price: 15_000_000_000_000,
                timestamp: current_time.saturating_sub((i as u64) * 300), // 5 min intervals
            });
        }

        Some(prices)
    }

    /// Quotes the most recent cross price record for the pair of assets
    pub fn x_last_price(env: Env, _base_asset: Asset, _quote_asset: Asset) -> Option<PriceData> {
        Some(PriceData {
            price: 15_000_000_000_000,
            timestamp: env.ledger().timestamp(),
        })
    }

    /// Quotes the cross price for the pair of assets at specific timestamp
    pub fn x_price(env: Env, _base_asset: Asset, _quote_asset: Asset, _timestamp: u64) -> Option<PriceData> {
        Some(PriceData {
            price: 15_000_000_000_000,
            timestamp: env.ledger().timestamp(),
        })
    }

    /// Quotes last N cross price records of for the pair of assets
    pub fn x_prices(env: Env, _base_asset: Asset, _quote_asset: Asset, records: u32) -> Option<Vec<PriceData>> {
        let mut prices = Vec::new(&env);
        let current_time = env.ledger().timestamp();

        for i in 0..records {
            prices.push_back(PriceData {
                price: 15_000_000_000_000,
                timestamp: current_time.saturating_sub((i as u64) * 300),
            });
        }

        Some(prices)
    }

    /// Quotes the time-weighted average price for the given asset over N recent records
    pub fn twap(_env: Env, _asset: Asset, _records: u32) -> Option<i128> {
        Some(15_000_000_000_000) // Same fixed price
    }

    /// Quotes the time-weighted average cross price for the given asset pair over N recent records
    pub fn x_twap(_env: Env, _base_asset: Asset, _quote_asset: Asset, _records: u32) -> Option<i128> {
        Some(15_000_000_000_000) // Same fixed price
    }

    /// Price feed resolution (default tick period timeframe, in seconds - 5 minutes)
    pub fn resolution(_env: Env) -> u32 {
        300 // 5 minutes in seconds
    }

    /// Historical records retention period, in seconds (24 hours)
    pub fn period(_env: Env) -> Option<u64> {
        Some(86400) // 24 hours
    }

    /// The most recent price update timestamp
    pub fn last_timestamp(env: Env) -> u64 {
        env.ledger().timestamp()
    }

    /// Contract protocol version
    pub fn version(_env: Env) -> u32 {
        1
    }

    /// Contract admin address
    pub fn admin(_env: Env) -> Option<Address> {
        None // No admin for mock
    }
}
