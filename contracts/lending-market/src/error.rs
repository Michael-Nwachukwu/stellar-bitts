//! Error types for the Lending Market contract

use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    // Initialization errors (1-9)
    /// Contract already initialized
    AlreadyInitialized = 1,
    /// Contract not initialized
    NotInitialized = 2,

    // Authorization errors (10-19)
    /// Caller is not authorized for this operation
    Unauthorized = 10,
    /// Only admin can perform this operation
    OnlyAdmin = 11,
    /// Only lender can perform this operation
    OnlyLender = 12,
    /// Only borrower can perform this operation
    OnlyBorrower = 13,

    // Offer errors (20-39)
    /// Offer not found
    OfferNotFound = 20,
    /// Offer is not active
    OfferNotActive = 21,
    /// Invalid interest rate (exceeds maximum)
    InvalidInterestRate = 22,
    /// Invalid collateral ratio
    InvalidCollateralRatio = 23,
    /// Invalid liquidation threshold
    InvalidLiquidationThreshold = 24,
    /// Invalid offer amount (must be positive)
    InvalidOfferAmount = 25,
    /// User has too many offers
    TooManyOffers = 26,
    /// Insufficient funds in offer
    InsufficientOfferFunds = 27,
    /// Cannot cancel offer with active loans
    OfferHasActiveLoans = 28,

    // Loan errors (40-59)
    /// Loan not found
    LoanNotFound = 40,
    /// Loan is not active
    LoanNotActive = 41,
    /// Invalid borrow amount (must be positive)
    InvalidBorrowAmount = 42,
    /// Invalid collateral amount (must be positive)
    InvalidCollateralAmount = 43,
    /// Insufficient collateral for requested borrow amount
    InsufficientCollateral = 44,
    /// User has too many loans
    TooManyLoans = 45,
    /// Invalid repayment amount
    InvalidRepayAmount = 46,
    /// Repayment exceeds debt
    RepayExceedsDebt = 47,
    /// Cannot withdraw collateral - would breach health threshold
    WithdrawalBreachesHealth = 48,
    /// Loan duration exceeds maximum allowed
    LoanDurationExceeded = 49,

    // Liquidation errors (60-79)
    /// Loan is not liquidatable (health is above threshold)
    NotLiquidatable = 60,
    /// Loan is already liquidated
    AlreadyLiquidated = 61,
    /// Liquidation failed - could not swap collateral
    LiquidationSwapFailed = 62,
    /// Insufficient collateral value to cover debt
    InsufficientCollateralValue = 63,

    // Oracle errors (80-99)
    /// Oracle address not set
    OracleNotSet = 80,
    /// Price data not available from oracle
    PriceNotAvailable = 81,
    /// Price data is stale (too old)
    StalePriceData = 82,
    /// Invalid price data from oracle
    InvalidPriceData = 83,

    // Token errors (100-119)
    /// USDC token not set
    UsdcTokenNotSet = 100,
    /// XLM token not set
    XlmTokenNotSet = 101,
    /// Token transfer failed
    TokenTransferFailed = 102,
    /// Insufficient token balance
    InsufficientBalance = 103,

    // Contract state errors (120-139)
    /// Contract is paused
    ContractPaused = 120,
    /// Reentrancy detected
    Reentrant = 121,
    /// Invalid input parameter
    InvalidInput = 122,
    /// Arithmetic overflow
    ArithmeticOverflow = 123,
    /// Arithmetic underflow
    ArithmeticUnderflow = 124,
    /// Division by zero
    DivisionByZero = 125,

    // Query errors (140-159)
    /// Invalid sort option
    InvalidSortOption = 140,
    /// Invalid pagination parameters
    InvalidPagination = 141,
    /// No offers available
    NoOffersAvailable = 142,
    /// No loans found
    NoLoansFound = 143,
}
