#![no_std]

//! Mock USDC Token Contract for Local Development
//! Simple token implementation for testing the lending platform

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),
}

#[contract]
pub struct MockUSDC;

#[contractimpl]
impl MockUSDC {
    /// Initialize the token with metadata (constructor)
    pub fn __constructor(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimal);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    /// Mint tokens to a recipient
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap();
        admin.require_auth();

        // Get current balance
        let balance_key = DataKey::Balance(to.clone());
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&balance_key)
            .unwrap_or(0);

        // Update balance using checked_add to prevent overflow
        let new_balance = current_balance.checked_add(amount).unwrap();
        env.storage().persistent().set(&balance_key, &new_balance);

        // Update total supply
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        let new_total = total_supply.checked_add(amount).unwrap();
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_total);
    }

    /// Get token balance
    pub fn balance(env: Env, id: Address) -> i128 {
        let balance_key = DataKey::Balance(id);
        env.storage().persistent().get(&balance_key).unwrap_or(0)
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let from_key = DataKey::Balance(from.clone());
        let to_key = DataKey::Balance(to.clone());

        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        env.storage().persistent().set(&from_key, &(from_balance - amount));

        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&to_key, &(to_balance + amount));
    }

    /// Transfer tokens from another account (requires allowance)
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        // Check allowance
        let allowance_key = DataKey::Allowance(from.clone(), spender.clone());
        let current_allowance: i128 = env
            .storage()
            .persistent()
            .get(&allowance_key)
            .unwrap_or(0);

        if current_allowance < amount {
            panic!("insufficient allowance");
        }

        // Decrease allowance
        env.storage()
            .persistent()
            .set(&allowance_key, &(current_allowance - amount));

        // Transfer
        let from_key = DataKey::Balance(from.clone());
        let to_key = DataKey::Balance(to.clone());

        let from_balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        env.storage().persistent().set(&from_key, &(from_balance - amount));

        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage().persistent().set(&to_key, &(to_balance + amount));
    }

    /// Approve spender to spend tokens
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, _expiration_ledger: u32) {
        from.require_auth();

        let allowance_key = DataKey::Allowance(from, spender);
        env.storage().persistent().set(&allowance_key, &amount);
    }

    /// Get allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let allowance_key = DataKey::Allowance(from, spender);
        env.storage().persistent().get(&allowance_key).unwrap_or(0)
    }

    /// Get token metadata
    pub fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::Decimals)
            .unwrap_or(7)
    }

    pub fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or(String::from_str(&env, "USDC"))
    }

    pub fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or(String::from_str(&env, "USDC"))
    }
}
