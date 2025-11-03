#![no_std]

//! Lending Market - Peer-to-Peer Lending Platform on Stellar
//!
//! This contract allows lenders to offer USDC loans at competitive interest rates,
//! and borrowers to take loans by depositing XLM as collateral.
//!
//! Features:
//! - Variable interest rates set by lenders (0.1% - 30% weekly)
//! - XLM collateral with max 50% LTV (200% minimum collateral ratio)
//! - Automated liquidation using Reflector oracle price feeds
//! - Per-second simple interest calculation
//! - Position management with health monitoring

mod contract;
mod error;
mod interest;
mod liquidation;
mod oracle;
mod reflector;
mod storage;
mod types;
mod validation;

// Re-export the contract
pub use contract::LendingMarket;
pub use contract::LendingMarketClient;
