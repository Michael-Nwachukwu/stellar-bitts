//! Storage helpers and utilities for the Lending Market contract

use crate::error::Error;
use crate::types::{DataKey, Loan, LendingOffer};
use soroban_sdk::{Address, Env, Vec};

// ========== Admin ==========

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn get_admin(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(Error::NotInitialized)
}

pub fn require_admin(env: &Env, address: &Address) -> Result<(), Error> {
    let admin = get_admin(env)?;
    if admin != *address {
        return Err(Error::OnlyAdmin);
    }
    Ok(())
}

// ========== Token Addresses ==========

pub fn set_usdc_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::UsdcToken, token);
}

pub fn get_usdc_token(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::UsdcToken)
        .ok_or(Error::UsdcTokenNotSet)
}

pub fn set_xlm_token(env: &Env, token: &Address) {
    env.storage().instance().set(&DataKey::XlmToken, token);
}

pub fn get_xlm_token(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::XlmToken)
        .ok_or(Error::XlmTokenNotSet)
}

// ========== Oracle ==========

pub fn set_oracle_address(env: &Env, oracle: &Address) {
    env.storage()
        .instance()
        .set(&DataKey::OracleAddress, oracle);
}

pub fn get_oracle_address(env: &Env) -> Result<Address, Error> {
    env.storage()
        .instance()
        .get(&DataKey::OracleAddress)
        .ok_or(Error::OracleNotSet)
}

// ========== Contract State ==========

pub fn set_max_interest_rate(env: &Env, rate: u32) {
    env.storage()
        .instance()
        .set(&DataKey::MaxInterestRate, &rate);
}

pub fn get_max_interest_rate(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::MaxInterestRate)
        .unwrap_or(3000) // Default 30%
}

pub fn set_paused(env: &Env, paused: bool) {
    env.storage().instance().set(&DataKey::IsPaused, &paused);
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::IsPaused)
        .unwrap_or(false)
}

pub fn require_not_paused(env: &Env) -> Result<(), Error> {
    if is_paused(env) {
        return Err(Error::ContractPaused);
    }
    Ok(())
}

// ========== Reentrancy Guard ==========

pub fn lock(env: &Env) -> Result<(), Error> {
    let locked = env
        .storage()
        .instance()
        .get(&DataKey::Locked)
        .unwrap_or(false);
    if locked {
        return Err(Error::Reentrant);
    }
    env.storage().instance().set(&DataKey::Locked, &true);
    Ok(())
}

pub fn unlock(env: &Env) {
    env.storage().instance().set(&DataKey::Locked, &false);
}

// ========== ID Counters ==========

pub fn get_next_offer_id(env: &Env) -> u64 {
    let current: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextOfferId)
        .unwrap_or(1);
    env.storage()
        .instance()
        .set(&DataKey::NextOfferId, &(current + 1));
    current
}

pub fn get_next_loan_id(env: &Env) -> u64 {
    let current: u64 = env
        .storage()
        .instance()
        .get(&DataKey::NextLoanId)
        .unwrap_or(1);
    env.storage()
        .instance()
        .set(&DataKey::NextLoanId, &(current + 1));
    current
}

// ========== Offers ==========

pub fn set_offer(env: &Env, offer: &LendingOffer) {
    env.storage()
        .persistent()
        .set(&DataKey::Offer(offer.offer_id), offer);
}

pub fn get_offer(env: &Env, offer_id: u64) -> Result<LendingOffer, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Offer(offer_id))
        .ok_or(Error::OfferNotFound)
}

pub fn has_offer(env: &Env, offer_id: u64) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Offer(offer_id))
}

pub fn remove_offer(env: &Env, offer_id: u64) {
    env.storage()
        .persistent()
        .remove(&DataKey::Offer(offer_id));
}

// ========== Loans ==========

pub fn set_loan(env: &Env, loan: &Loan) {
    env.storage()
        .persistent()
        .set(&DataKey::Loan(loan.loan_id), loan);
}

pub fn get_loan(env: &Env, loan_id: u64) -> Result<Loan, Error> {
    env.storage()
        .persistent()
        .get(&DataKey::Loan(loan_id))
        .ok_or(Error::LoanNotFound)
}

pub fn has_loan(env: &Env, loan_id: u64) -> bool {
    env.storage().persistent().has(&DataKey::Loan(loan_id))
}

pub fn remove_loan(env: &Env, loan_id: u64) {
    env.storage().persistent().remove(&DataKey::Loan(loan_id));
}

// ========== User Offers ==========

pub fn add_user_offer(env: &Env, user: &Address, offer_id: u64) {
    let key = DataKey::UserOffers(user.clone());
    let mut offers: Vec<u64> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    offers.push_back(offer_id);
    env.storage().persistent().set(&key, &offers);
}

pub fn get_user_offers(env: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserOffers(user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}

pub fn remove_user_offer(env: &Env, user: &Address, offer_id: u64) {
    let key = DataKey::UserOffers(user.clone());
    let mut offers: Vec<u64> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));

    // Find and remove the offer_id
    let mut new_offers = Vec::new(env);
    for i in 0..offers.len() {
        let id = offers.get(i).unwrap();
        if id != offer_id {
            new_offers.push_back(id);
        }
    }

    env.storage().persistent().set(&key, &new_offers);
}

// ========== User Loans (as Borrower) ==========

pub fn add_user_loan_as_borrower(env: &Env, user: &Address, loan_id: u64) {
    let key = DataKey::UserLoansAsBorrower(user.clone());
    let mut loans: Vec<u64> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    loans.push_back(loan_id);
    env.storage().persistent().set(&key, &loans);
}

pub fn get_user_loans_as_borrower(env: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserLoansAsBorrower(user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}

// ========== User Loans (as Lender) ==========

pub fn add_user_loan_as_lender(env: &Env, user: &Address, loan_id: u64) {
    let key = DataKey::UserLoansAsLender(user.clone());
    let mut loans: Vec<u64> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    loans.push_back(loan_id);
    env.storage().persistent().set(&key, &loans);
}

pub fn get_user_loans_as_lender(env: &Env, user: &Address) -> Vec<u64> {
    let key = DataKey::UserLoansAsLender(user.clone());
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}

// ========== Active Offers ==========

pub fn add_active_offer(env: &Env, offer_id: u64) {
    let mut offers: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::ActiveOffers)
        .unwrap_or(Vec::new(env));
    offers.push_back(offer_id);
    env.storage().persistent().set(&DataKey::ActiveOffers, &offers);
}

pub fn get_active_offers(env: &Env) -> Vec<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::ActiveOffers)
        .unwrap_or(Vec::new(env))
}

pub fn remove_active_offer(env: &Env, offer_id: u64) {
    let mut offers: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::ActiveOffers)
        .unwrap_or(Vec::new(env));

    let mut new_offers = Vec::new(env);
    for i in 0..offers.len() {
        let id = offers.get(i).unwrap();
        if id != offer_id {
            new_offers.push_back(id);
        }
    }

    env.storage()
        .persistent()
        .set(&DataKey::ActiveOffers, &new_offers);
}

// ========== Active Loans ==========

pub fn add_active_loan(env: &Env, loan_id: u64) {
    let mut loans: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::ActiveLoans)
        .unwrap_or(Vec::new(env));
    loans.push_back(loan_id);
    env.storage().persistent().set(&DataKey::ActiveLoans, &loans);
}

pub fn get_active_loans(env: &Env) -> Vec<u64> {
    env.storage()
        .persistent()
        .get(&DataKey::ActiveLoans)
        .unwrap_or(Vec::new(env))
}

pub fn remove_active_loan(env: &Env, loan_id: u64) {
    let mut loans: Vec<u64> = env
        .storage()
        .persistent()
        .get(&DataKey::ActiveLoans)
        .unwrap_or(Vec::new(env));

    let mut new_loans = Vec::new(env);
    for i in 0..loans.len() {
        let id = loans.get(i).unwrap();
        if id != loan_id {
            new_loans.push_back(id);
        }
    }

    env.storage().persistent().set(&DataKey::ActiveLoans, &new_loans);
}
