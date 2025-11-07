import { Buffer } from "buffer";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
} from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
  readonly standalone: {
    readonly networkPassphrase: "Standalone Network ; February 2017";
    readonly contractId: "CCUV43LKCNHODHN7YE5QHMW2VTOATVVOVLICBDZ2F2LLUIMVVU2KSLAC";
  };
};
export declare const Errors: {
  /**
   * Contract already initialized
   */
  1: {
    message: string;
  };
  /**
   * Contract not initialized
   */
  2: {
    message: string;
  };
  /**
   * Caller is not authorized for this operation
   */
  10: {
    message: string;
  };
  /**
   * Only admin can perform this operation
   */
  11: {
    message: string;
  };
  /**
   * Only lender can perform this operation
   */
  12: {
    message: string;
  };
  /**
   * Only borrower can perform this operation
   */
  13: {
    message: string;
  };
  /**
   * Offer not found
   */
  20: {
    message: string;
  };
  /**
   * Offer is not active
   */
  21: {
    message: string;
  };
  /**
   * Invalid interest rate (exceeds maximum)
   */
  22: {
    message: string;
  };
  /**
   * Invalid collateral ratio
   */
  23: {
    message: string;
  };
  /**
   * Invalid liquidation threshold
   */
  24: {
    message: string;
  };
  /**
   * Invalid offer amount (must be positive)
   */
  25: {
    message: string;
  };
  /**
   * User has too many offers
   */
  26: {
    message: string;
  };
  /**
   * Insufficient funds in offer
   */
  27: {
    message: string;
  };
  /**
   * Cannot cancel offer with active loans
   */
  28: {
    message: string;
  };
  /**
   * Loan not found
   */
  40: {
    message: string;
  };
  /**
   * Loan is not active
   */
  41: {
    message: string;
  };
  /**
   * Invalid borrow amount (must be positive)
   */
  42: {
    message: string;
  };
  /**
   * Invalid collateral amount (must be positive)
   */
  43: {
    message: string;
  };
  /**
   * Insufficient collateral for requested borrow amount
   */
  44: {
    message: string;
  };
  /**
   * User has too many loans
   */
  45: {
    message: string;
  };
  /**
   * Invalid repayment amount
   */
  46: {
    message: string;
  };
  /**
   * Repayment exceeds debt
   */
  47: {
    message: string;
  };
  /**
   * Cannot withdraw collateral - would breach health threshold
   */
  48: {
    message: string;
  };
  /**
   * Loan duration exceeds maximum allowed
   */
  49: {
    message: string;
  };
  /**
   * Loan is not liquidatable (health is above threshold)
   */
  60: {
    message: string;
  };
  /**
   * Loan is already liquidated
   */
  61: {
    message: string;
  };
  /**
   * Liquidation failed - could not swap collateral
   */
  62: {
    message: string;
  };
  /**
   * Insufficient collateral value to cover debt
   */
  63: {
    message: string;
  };
  /**
   * Oracle address not set
   */
  80: {
    message: string;
  };
  /**
   * Price data not available from oracle
   */
  81: {
    message: string;
  };
  /**
   * Price data is stale (too old)
   */
  82: {
    message: string;
  };
  /**
   * Invalid price data from oracle
   */
  83: {
    message: string;
  };
  /**
   * USDC token not set
   */
  100: {
    message: string;
  };
  /**
   * XLM token not set
   */
  101: {
    message: string;
  };
  /**
   * Token transfer failed
   */
  102: {
    message: string;
  };
  /**
   * Insufficient token balance
   */
  103: {
    message: string;
  };
  /**
   * Contract is paused
   */
  120: {
    message: string;
  };
  /**
   * Reentrancy detected
   */
  121: {
    message: string;
  };
  /**
   * Invalid input parameter
   */
  122: {
    message: string;
  };
  /**
   * Arithmetic overflow
   */
  123: {
    message: string;
  };
  /**
   * Arithmetic underflow
   */
  124: {
    message: string;
  };
  /**
   * Division by zero
   */
  125: {
    message: string;
  };
  /**
   * Invalid sort option
   */
  140: {
    message: string;
  };
  /**
   * Invalid pagination parameters
   */
  141: {
    message: string;
  };
  /**
   * No offers available
   */
  142: {
    message: string;
  };
  /**
   * No loans found
   */
  143: {
    message: string;
  };
};
/**
 * Lending offer created by a lender
 */
export interface LendingOffer {
  /**
   * Timestamp when offer was created
   */
  created_at: u64;
  /**
   * Whether this offer is active
   */
  is_active: boolean;
  /**
   * Address of the lender
   */
  lender: string;
  /**
   * Liquidation threshold in basis points (e.g., 12500 = 125%)
   */
  liquidation_threshold: u32;
  /**
   * Maximum loan duration in weeks
   */
  max_duration_weeks: u32;
  /**
   * Minimum collateral ratio in basis points (e.g., 20000 = 200% = max 50% LTV)
   */
  min_collateral_ratio: u32;
  /**
   * Unique identifier for this offer
   */
  offer_id: u64;
  /**
   * Amount of USDC available to lend (with 7 decimals)
   */
  usdc_amount: i128;
  /**
   * Weekly interest rate in basis points (e.g., 500 = 5%)
   */
  weekly_interest_rate: u32;
}
/**
 * Active loan position
 */
export interface Loan {
  /**
   * Accumulated interest so far (in USDC with 7 decimals)
   */
  accumulated_interest: i128;
  /**
   * Amount of USDC borrowed (with 7 decimals)
   */
  borrowed_amount: i128;
  /**
   * Address of the borrower
   */
  borrower: string;
  /**
   * Amount of XLM deposited as collateral (with 7 decimals)
   */
  collateral_amount: i128;
  /**
   * Weekly interest rate in basis points
   */
  interest_rate: u32;
  /**
   * Whether this loan is active
   */
  is_active: boolean;
  /**
   * Last time interest was updated
   */
  last_interest_update: u64;
  /**
   * Address of the lender
   */
  lender: string;
  /**
   * Liquidation threshold in basis points
   */
  liquidation_threshold: u32;
  /**
   * Unique identifier for this loan
   */
  loan_id: u64;
  /**
   * Reference to the original offer
   */
  offer_id: u64;
  /**
   * Timestamp when loan was created
   */
  start_time: u64;
}
/**
 * Health information for a loan
 */
export interface LoanHealth {
  /**
   * Current collateral value in USDC (with 7 decimals)
   */
  collateral_value_usd: i128;
  /**
   * Collateralization ratio in basis points
   */
  collateralization_ratio: u32;
  /**
   * Total debt including principal and interest (with 7 decimals)
   */
  debt_value_usd: i128;
  /**
   * Health factor in basis points (10000 = 100%)
   */
  health_factor: u32;
  /**
   * Whether this loan can be liquidated
   */
  is_liquidatable: boolean;
  /**
   * XLM price that would trigger liquidation (with oracle decimals)
   */
  liquidation_price: i128;
  /**
   * Loan identifier
   */
  loan_id: u64;
}
/**
 * Sort options for querying offers
 */
export type SortOption =
  | {
      tag: "BestRate";
      values: void;
    }
  | {
      tag: "HighestAmount";
      values: void;
    }
  | {
      tag: "Newest";
      values: void;
    };
/**
 * Storage keys for the contract
 */
export type DataKey =
  | {
      tag: "Admin";
      values: void;
    }
  | {
      tag: "UsdcToken";
      values: void;
    }
  | {
      tag: "XlmToken";
      values: void;
    }
  | {
      tag: "OracleAddress";
      values: void;
    }
  | {
      tag: "NextOfferId";
      values: void;
    }
  | {
      tag: "NextLoanId";
      values: void;
    }
  | {
      tag: "MaxInterestRate";
      values: void;
    }
  | {
      tag: "IsPaused";
      values: void;
    }
  | {
      tag: "Locked";
      values: void;
    }
  | {
      tag: "Offer";
      values: readonly [u64];
    }
  | {
      tag: "Loan";
      values: readonly [u64];
    }
  | {
      tag: "UserOffers";
      values: readonly [string];
    }
  | {
      tag: "UserLoansAsBorrower";
      values: readonly [string];
    }
  | {
      tag: "UserLoansAsLender";
      values: readonly [string];
    }
  | {
      tag: "ActiveOffers";
      values: void;
    }
  | {
      tag: "ActiveLoans";
      values: void;
    };
/**
 * Price data from oracle
 */
export interface PriceData {
  /**
   * Price value
   */
  price: i128;
  /**
   * Timestamp of the price
   */
  timestamp: u64;
}
export interface Client {
  /**
   * Construct and simulate a create_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new lending offer
   */
  create_offer: (
    {
      lender,
      usdc_amount,
      weekly_interest_rate,
      min_collateral_ratio,
      liquidation_threshold,
      max_duration_weeks,
    }: {
      lender: string;
      usdc_amount: i128;
      weekly_interest_rate: u32;
      min_collateral_ratio: u32;
      liquidation_threshold: u32;
      max_duration_weeks: u32;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<u64>>>;
  /**
   * Construct and simulate a cancel_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel an offer (only if no active loans against it)
   */
  cancel_offer: (
    {
      lender,
      offer_id,
    }: {
      lender: string;
      offer_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a withdraw_from_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw unused funds from an offer
   */
  withdraw_from_offer: (
    {
      lender,
      offer_id,
      amount,
    }: {
      lender: string;
      offer_id: u64;
      amount: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a borrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Borrow USDC against XLM collateral
   */
  borrow: (
    {
      borrower,
      offer_id,
      collateral_amount,
      borrow_amount,
    }: {
      borrower: string;
      offer_id: u64;
      collateral_amount: i128;
      borrow_amount: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<u64>>>;
  /**
   * Construct and simulate a repay transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Repay a loan (partial or full)
   */
  repay: (
    {
      borrower,
      loan_id,
      repay_amount,
    }: {
      borrower: string;
      loan_id: u64;
      repay_amount: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a add_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add more collateral to improve loan health
   */
  add_collateral: (
    {
      borrower,
      loan_id,
      additional_collateral,
    }: {
      borrower: string;
      loan_id: u64;
      additional_collateral: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a withdraw_collateral transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw excess collateral (if health allows)
   */
  withdraw_collateral: (
    {
      borrower,
      loan_id,
      amount,
    }: {
      borrower: string;
      loan_id: u64;
      amount: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a is_liquidatable transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a loan is liquidatable
   */
  is_liquidatable: (
    {
      loan_id,
    }: {
      loan_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<boolean>>>;
  /**
   * Construct and simulate a liquidate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Liquidate an undercollateralized loan
   * Anyone can call this function
   */
  liquidate: (
    {
      liquidator,
      loan_id,
    }: {
      liquidator: string;
      loan_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a batch_check_liquidations transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Batch check which loans are liquidatable
   */
  batch_check_liquidations: (
    {
      loan_ids,
    }: {
      loan_ids: Array<u64>;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<Array<u64>>>>;
  /**
   * Construct and simulate a get_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get offer details
   */
  get_offer: (
    {
      offer_id,
    }: {
      offer_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<LendingOffer>>>;
  /**
   * Construct and simulate a get_loan transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get loan details
   */
  get_loan: (
    {
      loan_id,
    }: {
      loan_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<Loan>>>;
  /**
   * Construct and simulate a get_loan_health transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get loan health information
   */
  get_loan_health: (
    {
      loan_id,
    }: {
      loan_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<LoanHealth>>>;
  /**
   * Construct and simulate a calculate_interest transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Calculate accumulated interest for a loan
   */
  calculate_interest: (
    {
      loan_id,
    }: {
      loan_id: u64;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<i128>>>;
  /**
   * Construct and simulate a get_xlm_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get current XLM price
   */
  get_xlm_price: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<i128>>>;
  /**
   * Construct and simulate a get_user_offers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get user's offers
   */
  get_user_offers: (
    {
      user,
    }: {
      user: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<u64>>>;
  /**
   * Construct and simulate a get_user_loans_as_borrower transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get user's loans as borrower
   */
  get_user_loans_as_borrower: (
    {
      user,
    }: {
      user: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<u64>>>;
  /**
   * Construct and simulate a get_user_loans_as_lender transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get user's loans as lender
   */
  get_user_loans_as_lender: (
    {
      user,
    }: {
      user: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<u64>>>;
  /**
   * Construct and simulate a get_active_offers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all active offers
   */
  get_active_offers: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u64>>>;
  /**
   * Construct and simulate a get_active_loans transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all active loans
   */
  get_active_loans: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u64>>>;
  /**
   * Construct and simulate a set_max_interest_rate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update maximum interest rate
   */
  set_max_interest_rate: (
    {
      admin,
      max_rate,
    }: {
      admin: string;
      max_rate: u32;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a set_oracle_address transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update oracle address
   */
  set_oracle_address: (
    {
      admin,
      oracle,
    }: {
      admin: string;
      oracle: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a pause_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pause contract
   */
  pause_contract: (
    {
      admin,
    }: {
      admin: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a unpause_contract transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Unpause contract
   */
  unpause_contract: (
    {
      admin,
    }: {
      admin: string;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;
      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;
      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Result<void>>>;
  /**
   * Construct and simulate a admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get admin address
   */
  admin: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;
    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;
    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<string>>>;
}
export declare class Client extends ContractClient {
  readonly options: ContractClientOptions;
  static deploy<T = Client>(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    {
      admin,
      usdc_token,
      xlm_token,
      oracle_address,
      max_interest_rate,
    }: {
      admin: string;
      usdc_token: string;
      xlm_token: string;
      oracle_address: string;
      max_interest_rate: u32;
    },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>>;
  constructor(options: ContractClientOptions);
  readonly fromJSON: {
    create_offer: (
      json: string,
    ) => AssembledTransaction<
      Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    cancel_offer: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    withdraw_from_offer: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    borrow: (
      json: string,
    ) => AssembledTransaction<
      Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    repay: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    add_collateral: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    withdraw_collateral: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    is_liquidatable: (
      json: string,
    ) => AssembledTransaction<
      Result<boolean, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    liquidate: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    batch_check_liquidations: (
      json: string,
    ) => AssembledTransaction<
      Result<bigint[], import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_offer: (
      json: string,
    ) => AssembledTransaction<
      Result<LendingOffer, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_loan: (
      json: string,
    ) => AssembledTransaction<
      Result<Loan, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_loan_health: (
      json: string,
    ) => AssembledTransaction<
      Result<LoanHealth, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    calculate_interest: (
      json: string,
    ) => AssembledTransaction<
      Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_xlm_price: (
      json: string,
    ) => AssembledTransaction<
      Result<bigint, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    get_user_offers: (json: string) => AssembledTransaction<bigint[]>;
    get_user_loans_as_borrower: (
      json: string,
    ) => AssembledTransaction<bigint[]>;
    get_user_loans_as_lender: (json: string) => AssembledTransaction<bigint[]>;
    get_active_offers: (json: string) => AssembledTransaction<bigint[]>;
    get_active_loans: (json: string) => AssembledTransaction<bigint[]>;
    set_max_interest_rate: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    set_oracle_address: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    pause_contract: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    unpause_contract: (
      json: string,
    ) => AssembledTransaction<
      Result<void, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
    admin: (
      json: string,
    ) => AssembledTransaction<
      Result<string, import("@stellar/stellar-sdk/contract").ErrorMessage>
    >;
  };
}
