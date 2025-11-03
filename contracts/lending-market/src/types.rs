//! Data types and structures for the Lending Market contract

use soroban_sdk::{contracttype, Address, String, Vec};

/// Lending offer created by a lender
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LendingOffer {
    /// Unique identifier for this offer
    pub offer_id: u64,
    /// Address of the lender
    pub lender: Address,
    /// Amount of USDC available to lend (with 7 decimals)
    pub usdc_amount: i128,
    /// Weekly interest rate in basis points (e.g., 500 = 5%)
    pub weekly_interest_rate: u32,
    /// Minimum collateral ratio in basis points (e.g., 20000 = 200% = max 50% LTV)
    pub min_collateral_ratio: u32,
    /// Liquidation threshold in basis points (e.g., 12500 = 125%)
    pub liquidation_threshold: u32,
    /// Maximum loan duration in weeks
    pub max_duration_weeks: u32,
    /// Whether this offer is active
    pub is_active: bool,
    /// Timestamp when offer was created
    pub created_at: u64,
}

/// Active loan position
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Loan {
    /// Unique identifier for this loan
    pub loan_id: u64,
    /// Reference to the original offer
    pub offer_id: u64,
    /// Address of the borrower
    pub borrower: Address,
    /// Address of the lender
    pub lender: Address,
    /// Amount of XLM deposited as collateral (with 7 decimals)
    pub collateral_amount: i128,
    /// Amount of USDC borrowed (with 7 decimals)
    pub borrowed_amount: i128,
    /// Weekly interest rate in basis points
    pub interest_rate: u32,
    /// Timestamp when loan was created
    pub start_time: u64,
    /// Last time interest was updated
    pub last_interest_update: u64,
    /// Accumulated interest so far (in USDC with 7 decimals)
    pub accumulated_interest: i128,
    /// Liquidation threshold in basis points
    pub liquidation_threshold: u32,
    /// Whether this loan is active
    pub is_active: bool,
}

/// Health information for a loan
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LoanHealth {
    /// Loan identifier
    pub loan_id: u64,
    /// Current collateral value in USDC (with 7 decimals)
    pub collateral_value_usd: i128,
    /// Total debt including principal and interest (with 7 decimals)
    pub debt_value_usd: i128,
    /// Collateralization ratio in basis points
    pub collateralization_ratio: u32,
    /// XLM price that would trigger liquidation (with oracle decimals)
    pub liquidation_price: i128,
    /// Health factor in basis points (10000 = 100%)
    pub health_factor: u32,
    /// Whether this loan can be liquidated
    pub is_liquidatable: bool,
}

/// Sort options for querying offers
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum SortOption {
    /// Sort by best (lowest) interest rate
    BestRate,
    /// Sort by highest amount available
    HighestAmount,
    /// Sort by newest first
    Newest,
}

/// Storage keys for the contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    /// Contract administrator
    Admin,
    /// USDC token address
    UsdcToken,
    /// XLM token address (native)
    XlmToken,
    /// Reflector oracle contract address
    OracleAddress,
    /// Next offer ID counter
    NextOfferId,
    /// Next loan ID counter
    NextLoanId,
    /// Maximum allowed interest rate in basis points (e.g., 3000 = 30%)
    MaxInterestRate,
    /// Contract paused state
    IsPaused,
    /// Reentrancy lock
    Locked,
    /// Individual offer by ID
    Offer(u64),
    /// Individual loan by ID
    Loan(u64),
    /// List of offer IDs for a user
    UserOffers(Address),
    /// List of loan IDs where user is borrower
    UserLoansAsBorrower(Address),
    /// List of loan IDs where user is lender
    UserLoansAsLender(Address),
    /// List of all active offer IDs
    ActiveOffers,
    /// List of all active loan IDs
    ActiveLoans,
}

/// Price data from oracle
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    /// Price value
    pub price: i128,
    /// Timestamp of the price
    pub timestamp: u64,
}

/// Constants for the contract
pub const BASIS_POINTS: u32 = 10000;
pub const SECONDS_PER_WEEK: u64 = 604800;
pub const MAX_OFFERS_PER_USER: u32 = 10;
pub const MAX_LOANS_PER_USER: u32 = 20;
pub const PRICE_STALENESS_THRESHOLD: u64 = 300; // 5 minutes
pub const LIQUIDATION_BONUS_BPS: u32 = 500; // 5% bonus to liquidator
