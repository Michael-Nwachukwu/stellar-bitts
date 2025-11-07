import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}
export const networks = {
  standalone: {
    networkPassphrase: "Standalone Network ; February 2017",
    contractId: "CCUV43LKCNHODHN7YE5QHMW2VTOATVVOVLICBDZ2F2LLUIMVVU2KSLAC",
  },
};
export const Errors = {
  /**
   * Contract already initialized
   */
  1: { message: "AlreadyInitialized" },
  /**
   * Contract not initialized
   */
  2: { message: "NotInitialized" },
  /**
   * Caller is not authorized for this operation
   */
  10: { message: "Unauthorized" },
  /**
   * Only admin can perform this operation
   */
  11: { message: "OnlyAdmin" },
  /**
   * Only lender can perform this operation
   */
  12: { message: "OnlyLender" },
  /**
   * Only borrower can perform this operation
   */
  13: { message: "OnlyBorrower" },
  /**
   * Offer not found
   */
  20: { message: "OfferNotFound" },
  /**
   * Offer is not active
   */
  21: { message: "OfferNotActive" },
  /**
   * Invalid interest rate (exceeds maximum)
   */
  22: { message: "InvalidInterestRate" },
  /**
   * Invalid collateral ratio
   */
  23: { message: "InvalidCollateralRatio" },
  /**
   * Invalid liquidation threshold
   */
  24: { message: "InvalidLiquidationThreshold" },
  /**
   * Invalid offer amount (must be positive)
   */
  25: { message: "InvalidOfferAmount" },
  /**
   * User has too many offers
   */
  26: { message: "TooManyOffers" },
  /**
   * Insufficient funds in offer
   */
  27: { message: "InsufficientOfferFunds" },
  /**
   * Cannot cancel offer with active loans
   */
  28: { message: "OfferHasActiveLoans" },
  /**
   * Loan not found
   */
  40: { message: "LoanNotFound" },
  /**
   * Loan is not active
   */
  41: { message: "LoanNotActive" },
  /**
   * Invalid borrow amount (must be positive)
   */
  42: { message: "InvalidBorrowAmount" },
  /**
   * Invalid collateral amount (must be positive)
   */
  43: { message: "InvalidCollateralAmount" },
  /**
   * Insufficient collateral for requested borrow amount
   */
  44: { message: "InsufficientCollateral" },
  /**
   * User has too many loans
   */
  45: { message: "TooManyLoans" },
  /**
   * Invalid repayment amount
   */
  46: { message: "InvalidRepayAmount" },
  /**
   * Repayment exceeds debt
   */
  47: { message: "RepayExceedsDebt" },
  /**
   * Cannot withdraw collateral - would breach health threshold
   */
  48: { message: "WithdrawalBreachesHealth" },
  /**
   * Loan duration exceeds maximum allowed
   */
  49: { message: "LoanDurationExceeded" },
  /**
   * Loan is not liquidatable (health is above threshold)
   */
  60: { message: "NotLiquidatable" },
  /**
   * Loan is already liquidated
   */
  61: { message: "AlreadyLiquidated" },
  /**
   * Liquidation failed - could not swap collateral
   */
  62: { message: "LiquidationSwapFailed" },
  /**
   * Insufficient collateral value to cover debt
   */
  63: { message: "InsufficientCollateralValue" },
  /**
   * Oracle address not set
   */
  80: { message: "OracleNotSet" },
  /**
   * Price data not available from oracle
   */
  81: { message: "PriceNotAvailable" },
  /**
   * Price data is stale (too old)
   */
  82: { message: "StalePriceData" },
  /**
   * Invalid price data from oracle
   */
  83: { message: "InvalidPriceData" },
  /**
   * USDC token not set
   */
  100: { message: "UsdcTokenNotSet" },
  /**
   * XLM token not set
   */
  101: { message: "XlmTokenNotSet" },
  /**
   * Token transfer failed
   */
  102: { message: "TokenTransferFailed" },
  /**
   * Insufficient token balance
   */
  103: { message: "InsufficientBalance" },
  /**
   * Contract is paused
   */
  120: { message: "ContractPaused" },
  /**
   * Reentrancy detected
   */
  121: { message: "Reentrant" },
  /**
   * Invalid input parameter
   */
  122: { message: "InvalidInput" },
  /**
   * Arithmetic overflow
   */
  123: { message: "ArithmeticOverflow" },
  /**
   * Arithmetic underflow
   */
  124: { message: "ArithmeticUnderflow" },
  /**
   * Division by zero
   */
  125: { message: "DivisionByZero" },
  /**
   * Invalid sort option
   */
  140: { message: "InvalidSortOption" },
  /**
   * Invalid pagination parameters
   */
  141: { message: "InvalidPagination" },
  /**
   * No offers available
   */
  142: { message: "NoOffersAvailable" },
  /**
   * No loans found
   */
  143: { message: "NoLoansFound" },
};
export class Client extends ContractClient {
  options;
  static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin, usdc_token, xlm_token, oracle_address, max_interest_rate },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options,
  ) {
    return ContractClient.deploy(
      { admin, usdc_token, xlm_token, oracle_address, max_interest_rate },
      options,
    );
  }
  constructor(options) {
    super(
      new ContractSpec([
        "AAAAAAAAADdJbml0aWFsaXplIHRoZSBjb250cmFjdApUaGlzIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBvbmNlAAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAABQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAp1c2RjX3Rva2VuAAAAAAATAAAAAAAAAAl4bG1fdG9rZW4AAAAAAAATAAAAAAAAAA5vcmFjbGVfYWRkcmVzcwAAAAAAEwAAAAAAAAARbWF4X2ludGVyZXN0X3JhdGUAAAAAAAAEAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAABpDcmVhdGUgYSBuZXcgbGVuZGluZyBvZmZlcgAAAAAADGNyZWF0ZV9vZmZlcgAAAAYAAAAAAAAABmxlbmRlcgAAAAAAEwAAAAAAAAALdXNkY19hbW91bnQAAAAACwAAAAAAAAAUd2Vla2x5X2ludGVyZXN0X3JhdGUAAAAEAAAAAAAAABRtaW5fY29sbGF0ZXJhbF9yYXRpbwAAAAQAAAAAAAAAFWxpcXVpZGF0aW9uX3RocmVzaG9sZAAAAAAAAAQAAAAAAAAAEm1heF9kdXJhdGlvbl93ZWVrcwAAAAAABAAAAAEAAAPpAAAABgAAAAM=",
        "AAAAAAAAADRDYW5jZWwgYW4gb2ZmZXIgKG9ubHkgaWYgbm8gYWN0aXZlIGxvYW5zIGFnYWluc3QgaXQpAAAADGNhbmNlbF9vZmZlcgAAAAIAAAAAAAAABmxlbmRlcgAAAAAAEwAAAAAAAAAIb2ZmZXJfaWQAAAAGAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAACNXaXRoZHJhdyB1bnVzZWQgZnVuZHMgZnJvbSBhbiBvZmZlcgAAAAATd2l0aGRyYXdfZnJvbV9vZmZlcgAAAAADAAAAAAAAAAZsZW5kZXIAAAAAABMAAAAAAAAACG9mZmVyX2lkAAAABgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAACJCb3Jyb3cgVVNEQyBhZ2FpbnN0IFhMTSBjb2xsYXRlcmFsAAAAAAAGYm9ycm93AAAAAAAEAAAAAAAAAAhib3Jyb3dlcgAAABMAAAAAAAAACG9mZmVyX2lkAAAABgAAAAAAAAARY29sbGF0ZXJhbF9hbW91bnQAAAAAAAALAAAAAAAAAA1ib3Jyb3dfYW1vdW50AAAAAAAACwAAAAEAAAPpAAAABgAAAAM=",
        "AAAAAAAAAB5SZXBheSBhIGxvYW4gKHBhcnRpYWwgb3IgZnVsbCkAAAAAAAVyZXBheQAAAAAAAAMAAAAAAAAACGJvcnJvd2VyAAAAEwAAAAAAAAAHbG9hbl9pZAAAAAAGAAAAAAAAAAxyZXBheV9hbW91bnQAAAALAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAACpBZGQgbW9yZSBjb2xsYXRlcmFsIHRvIGltcHJvdmUgbG9hbiBoZWFsdGgAAAAAAA5hZGRfY29sbGF0ZXJhbAAAAAAAAwAAAAAAAAAIYm9ycm93ZXIAAAATAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAAAAAAAFWFkZGl0aW9uYWxfY29sbGF0ZXJhbAAAAAAAAAsAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAC1XaXRoZHJhdyBleGNlc3MgY29sbGF0ZXJhbCAoaWYgaGVhbHRoIGFsbG93cykAAAAAAAATd2l0aGRyYXdfY29sbGF0ZXJhbAAAAAADAAAAAAAAAAhib3Jyb3dlcgAAABMAAAAAAAAAB2xvYW5faWQAAAAABgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAAB9DaGVjayBpZiBhIGxvYW4gaXMgbGlxdWlkYXRhYmxlAAAAAA9pc19saXF1aWRhdGFibGUAAAAAAQAAAAAAAAAHbG9hbl9pZAAAAAAGAAAAAQAAA+kAAAABAAAAAw==",
        "AAAAAAAAAENMaXF1aWRhdGUgYW4gdW5kZXJjb2xsYXRlcmFsaXplZCBsb2FuCkFueW9uZSBjYW4gY2FsbCB0aGlzIGZ1bmN0aW9uAAAAAAlsaXF1aWRhdGUAAAAAAAACAAAAAAAAAApsaXF1aWRhdG9yAAAAAAATAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAChCYXRjaCBjaGVjayB3aGljaCBsb2FucyBhcmUgbGlxdWlkYXRhYmxlAAAAGGJhdGNoX2NoZWNrX2xpcXVpZGF0aW9ucwAAAAEAAAAAAAAACGxvYW5faWRzAAAD6gAAAAYAAAABAAAD6QAAA+oAAAAGAAAAAw==",
        "AAAAAAAAABFHZXQgb2ZmZXIgZGV0YWlscwAAAAAAAAlnZXRfb2ZmZXIAAAAAAAABAAAAAAAAAAhvZmZlcl9pZAAAAAYAAAABAAAD6QAAB9AAAAAMTGVuZGluZ09mZmVyAAAAAw==",
        "AAAAAAAAABBHZXQgbG9hbiBkZXRhaWxzAAAACGdldF9sb2FuAAAAAQAAAAAAAAAHbG9hbl9pZAAAAAAGAAAAAQAAA+kAAAfQAAAABExvYW4AAAAD",
        "AAAAAAAAABtHZXQgbG9hbiBoZWFsdGggaW5mb3JtYXRpb24AAAAAD2dldF9sb2FuX2hlYWx0aAAAAAABAAAAAAAAAAdsb2FuX2lkAAAAAAYAAAABAAAD6QAAB9AAAAAKTG9hbkhlYWx0aAAAAAAAAw==",
        "AAAAAAAAAClDYWxjdWxhdGUgYWNjdW11bGF0ZWQgaW50ZXJlc3QgZm9yIGEgbG9hbgAAAAAAABJjYWxjdWxhdGVfaW50ZXJlc3QAAAAAAAEAAAAAAAAAB2xvYW5faWQAAAAABgAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAABVHZXQgY3VycmVudCBYTE0gcHJpY2UAAAAAAAANZ2V0X3hsbV9wcmljZQAAAAAAAAAAAAABAAAD6QAAAAsAAAAD",
        "AAAAAAAAABFHZXQgdXNlcidzIG9mZmVycwAAAAAAAA9nZXRfdXNlcl9vZmZlcnMAAAAAAQAAAAAAAAAEdXNlcgAAABMAAAABAAAD6gAAAAY=",
        "AAAAAAAAABxHZXQgdXNlcidzIGxvYW5zIGFzIGJvcnJvd2VyAAAAGmdldF91c2VyX2xvYW5zX2FzX2JvcnJvd2VyAAAAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPqAAAABg==",
        "AAAAAAAAABpHZXQgdXNlcidzIGxvYW5zIGFzIGxlbmRlcgAAAAAAGGdldF91c2VyX2xvYW5zX2FzX2xlbmRlcgAAAAEAAAAAAAAABHVzZXIAAAATAAAAAQAAA+oAAAAG",
        "AAAAAAAAABVHZXQgYWxsIGFjdGl2ZSBvZmZlcnMAAAAAAAARZ2V0X2FjdGl2ZV9vZmZlcnMAAAAAAAAAAAAAAQAAA+oAAAAG",
        "AAAAAAAAABRHZXQgYWxsIGFjdGl2ZSBsb2FucwAAABBnZXRfYWN0aXZlX2xvYW5zAAAAAAAAAAEAAAPqAAAABg==",
        "AAAAAAAAABxVcGRhdGUgbWF4aW11bSBpbnRlcmVzdCByYXRlAAAAFXNldF9tYXhfaW50ZXJlc3RfcmF0ZQAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIbWF4X3JhdGUAAAAEAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAABVVcGRhdGUgb3JhY2xlIGFkZHJlc3MAAAAAAAASc2V0X29yYWNsZV9hZGRyZXNzAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAA5QYXVzZSBjb250cmFjdAAAAAAADnBhdXNlX2NvbnRyYWN0AAAAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAABBVbnBhdXNlIGNvbnRyYWN0AAAAEHVucGF1c2VfY29udHJhY3QAAAABAAAAAAAAAAVhZG1pbgAAAAAAABMAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAVhZG1pbgAAAAAAAAAAAAABAAAD6QAAABMAAAAD",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAALwAAABxDb250cmFjdCBhbHJlYWR5IGluaXRpYWxpemVkAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAQAAABhDb250cmFjdCBub3QgaW5pdGlhbGl6ZWQAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAIAAAArQ2FsbGVyIGlzIG5vdCBhdXRob3JpemVkIGZvciB0aGlzIG9wZXJhdGlvbgAAAAAMVW5hdXRob3JpemVkAAAACgAAACVPbmx5IGFkbWluIGNhbiBwZXJmb3JtIHRoaXMgb3BlcmF0aW9uAAAAAAAACU9ubHlBZG1pbgAAAAAAAAsAAAAmT25seSBsZW5kZXIgY2FuIHBlcmZvcm0gdGhpcyBvcGVyYXRpb24AAAAAAApPbmx5TGVuZGVyAAAAAAAMAAAAKE9ubHkgYm9ycm93ZXIgY2FuIHBlcmZvcm0gdGhpcyBvcGVyYXRpb24AAAAMT25seUJvcnJvd2VyAAAADQAAAA9PZmZlciBub3QgZm91bmQAAAAADU9mZmVyTm90Rm91bmQAAAAAAAAUAAAAE09mZmVyIGlzIG5vdCBhY3RpdmUAAAAADk9mZmVyTm90QWN0aXZlAAAAAAAVAAAAJ0ludmFsaWQgaW50ZXJlc3QgcmF0ZSAoZXhjZWVkcyBtYXhpbXVtKQAAAAATSW52YWxpZEludGVyZXN0UmF0ZQAAAAAWAAAAGEludmFsaWQgY29sbGF0ZXJhbCByYXRpbwAAABZJbnZhbGlkQ29sbGF0ZXJhbFJhdGlvAAAAAAAXAAAAHUludmFsaWQgbGlxdWlkYXRpb24gdGhyZXNob2xkAAAAAAAAG0ludmFsaWRMaXF1aWRhdGlvblRocmVzaG9sZAAAAAAYAAAAJ0ludmFsaWQgb2ZmZXIgYW1vdW50IChtdXN0IGJlIHBvc2l0aXZlKQAAAAASSW52YWxpZE9mZmVyQW1vdW50AAAAAAAZAAAAGFVzZXIgaGFzIHRvbyBtYW55IG9mZmVycwAAAA1Ub29NYW55T2ZmZXJzAAAAAAAAGgAAABtJbnN1ZmZpY2llbnQgZnVuZHMgaW4gb2ZmZXIAAAAAFkluc3VmZmljaWVudE9mZmVyRnVuZHMAAAAAABsAAAAlQ2Fubm90IGNhbmNlbCBvZmZlciB3aXRoIGFjdGl2ZSBsb2FucwAAAAAAABNPZmZlckhhc0FjdGl2ZUxvYW5zAAAAABwAAAAOTG9hbiBub3QgZm91bmQAAAAAAAxMb2FuTm90Rm91bmQAAAAoAAAAEkxvYW4gaXMgbm90IGFjdGl2ZQAAAAAADUxvYW5Ob3RBY3RpdmUAAAAAAAApAAAAKEludmFsaWQgYm9ycm93IGFtb3VudCAobXVzdCBiZSBwb3NpdGl2ZSkAAAATSW52YWxpZEJvcnJvd0Ftb3VudAAAAAAqAAAALEludmFsaWQgY29sbGF0ZXJhbCBhbW91bnQgKG11c3QgYmUgcG9zaXRpdmUpAAAAF0ludmFsaWRDb2xsYXRlcmFsQW1vdW50AAAAACsAAAAzSW5zdWZmaWNpZW50IGNvbGxhdGVyYWwgZm9yIHJlcXVlc3RlZCBib3Jyb3cgYW1vdW50AAAAABZJbnN1ZmZpY2llbnRDb2xsYXRlcmFsAAAAAAAsAAAAF1VzZXIgaGFzIHRvbyBtYW55IGxvYW5zAAAAAAxUb29NYW55TG9hbnMAAAAtAAAAGEludmFsaWQgcmVwYXltZW50IGFtb3VudAAAABJJbnZhbGlkUmVwYXlBbW91bnQAAAAAAC4AAAAWUmVwYXltZW50IGV4Y2VlZHMgZGVidAAAAAAAEFJlcGF5RXhjZWVkc0RlYnQAAAAvAAAAOkNhbm5vdCB3aXRoZHJhdyBjb2xsYXRlcmFsIC0gd291bGQgYnJlYWNoIGhlYWx0aCB0aHJlc2hvbGQAAAAAABhXaXRoZHJhd2FsQnJlYWNoZXNIZWFsdGgAAAAwAAAAJUxvYW4gZHVyYXRpb24gZXhjZWVkcyBtYXhpbXVtIGFsbG93ZWQAAAAAAAAUTG9hbkR1cmF0aW9uRXhjZWVkZWQAAAAxAAAANExvYW4gaXMgbm90IGxpcXVpZGF0YWJsZSAoaGVhbHRoIGlzIGFib3ZlIHRocmVzaG9sZCkAAAAPTm90TGlxdWlkYXRhYmxlAAAAADwAAAAaTG9hbiBpcyBhbHJlYWR5IGxpcXVpZGF0ZWQAAAAAABFBbHJlYWR5TGlxdWlkYXRlZAAAAAAAAD0AAAAuTGlxdWlkYXRpb24gZmFpbGVkIC0gY291bGQgbm90IHN3YXAgY29sbGF0ZXJhbAAAAAAAFUxpcXVpZGF0aW9uU3dhcEZhaWxlZAAAAAAAAD4AAAArSW5zdWZmaWNpZW50IGNvbGxhdGVyYWwgdmFsdWUgdG8gY292ZXIgZGVidAAAAAAbSW5zdWZmaWNpZW50Q29sbGF0ZXJhbFZhbHVlAAAAAD8AAAAWT3JhY2xlIGFkZHJlc3Mgbm90IHNldAAAAAAADE9yYWNsZU5vdFNldAAAAFAAAAAkUHJpY2UgZGF0YSBub3QgYXZhaWxhYmxlIGZyb20gb3JhY2xlAAAAEVByaWNlTm90QXZhaWxhYmxlAAAAAAAAUQAAAB1QcmljZSBkYXRhIGlzIHN0YWxlICh0b28gb2xkKQAAAAAAAA5TdGFsZVByaWNlRGF0YQAAAAAAUgAAAB5JbnZhbGlkIHByaWNlIGRhdGEgZnJvbSBvcmFjbGUAAAAAABBJbnZhbGlkUHJpY2VEYXRhAAAAUwAAABJVU0RDIHRva2VuIG5vdCBzZXQAAAAAAA9Vc2RjVG9rZW5Ob3RTZXQAAAAAZAAAABFYTE0gdG9rZW4gbm90IHNldAAAAAAAAA5YbG1Ub2tlbk5vdFNldAAAAAAAZQAAABVUb2tlbiB0cmFuc2ZlciBmYWlsZWQAAAAAAAATVG9rZW5UcmFuc2ZlckZhaWxlZAAAAABmAAAAGkluc3VmZmljaWVudCB0b2tlbiBiYWxhbmNlAAAAAAATSW5zdWZmaWNpZW50QmFsYW5jZQAAAABnAAAAEkNvbnRyYWN0IGlzIHBhdXNlZAAAAAAADkNvbnRyYWN0UGF1c2VkAAAAAAB4AAAAE1JlZW50cmFuY3kgZGV0ZWN0ZWQAAAAACVJlZW50cmFudAAAAAAAAHkAAAAXSW52YWxpZCBpbnB1dCBwYXJhbWV0ZXIAAAAADEludmFsaWRJbnB1dAAAAHoAAAATQXJpdGhtZXRpYyBvdmVyZmxvdwAAAAASQXJpdGhtZXRpY092ZXJmbG93AAAAAAB7AAAAFEFyaXRobWV0aWMgdW5kZXJmbG93AAAAE0FyaXRobWV0aWNVbmRlcmZsb3cAAAAAfAAAABBEaXZpc2lvbiBieSB6ZXJvAAAADkRpdmlzaW9uQnlaZXJvAAAAAAB9AAAAE0ludmFsaWQgc29ydCBvcHRpb24AAAAAEUludmFsaWRTb3J0T3B0aW9uAAAAAAAAjAAAAB1JbnZhbGlkIHBhZ2luYXRpb24gcGFyYW1ldGVycwAAAAAAABFJbnZhbGlkUGFnaW5hdGlvbgAAAAAAAI0AAAATTm8gb2ZmZXJzIGF2YWlsYWJsZQAAAAARTm9PZmZlcnNBdmFpbGFibGUAAAAAAACOAAAADk5vIGxvYW5zIGZvdW5kAAAAAAAMTm9Mb2Fuc0ZvdW5kAAAAjw==",
        "AAAAAQAAACFMZW5kaW5nIG9mZmVyIGNyZWF0ZWQgYnkgYSBsZW5kZXIAAAAAAAAAAAAADExlbmRpbmdPZmZlcgAAAAkAAAAgVGltZXN0YW1wIHdoZW4gb2ZmZXIgd2FzIGNyZWF0ZWQAAAAKY3JlYXRlZF9hdAAAAAAABgAAABxXaGV0aGVyIHRoaXMgb2ZmZXIgaXMgYWN0aXZlAAAACWlzX2FjdGl2ZQAAAAAAAAEAAAAVQWRkcmVzcyBvZiB0aGUgbGVuZGVyAAAAAAAABmxlbmRlcgAAAAAAEwAAADpMaXF1aWRhdGlvbiB0aHJlc2hvbGQgaW4gYmFzaXMgcG9pbnRzIChlLmcuLCAxMjUwMCA9IDEyNSUpAAAAAAAVbGlxdWlkYXRpb25fdGhyZXNob2xkAAAAAAAABAAAAB5NYXhpbXVtIGxvYW4gZHVyYXRpb24gaW4gd2Vla3MAAAAAABJtYXhfZHVyYXRpb25fd2Vla3MAAAAAAAQAAABLTWluaW11bSBjb2xsYXRlcmFsIHJhdGlvIGluIGJhc2lzIHBvaW50cyAoZS5nLiwgMjAwMDAgPSAyMDAlID0gbWF4IDUwJSBMVFYpAAAAABRtaW5fY29sbGF0ZXJhbF9yYXRpbwAAAAQAAAAgVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgb2ZmZXIAAAAIb2ZmZXJfaWQAAAAGAAAAMkFtb3VudCBvZiBVU0RDIGF2YWlsYWJsZSB0byBsZW5kICh3aXRoIDcgZGVjaW1hbHMpAAAAAAALdXNkY19hbW91bnQAAAAACwAAADVXZWVrbHkgaW50ZXJlc3QgcmF0ZSBpbiBiYXNpcyBwb2ludHMgKGUuZy4sIDUwMCA9IDUlKQAAAAAAABR3ZWVrbHlfaW50ZXJlc3RfcmF0ZQAAAAQ=",
        "AAAAAQAAABRBY3RpdmUgbG9hbiBwb3NpdGlvbgAAAAAAAAAETG9hbgAAAAwAAAA1QWNjdW11bGF0ZWQgaW50ZXJlc3Qgc28gZmFyIChpbiBVU0RDIHdpdGggNyBkZWNpbWFscykAAAAAAAAUYWNjdW11bGF0ZWRfaW50ZXJlc3QAAAALAAAAKUFtb3VudCBvZiBVU0RDIGJvcnJvd2VkICh3aXRoIDcgZGVjaW1hbHMpAAAAAAAAD2JvcnJvd2VkX2Ftb3VudAAAAAALAAAAF0FkZHJlc3Mgb2YgdGhlIGJvcnJvd2VyAAAAAAhib3Jyb3dlcgAAABMAAAA3QW1vdW50IG9mIFhMTSBkZXBvc2l0ZWQgYXMgY29sbGF0ZXJhbCAod2l0aCA3IGRlY2ltYWxzKQAAAAARY29sbGF0ZXJhbF9hbW91bnQAAAAAAAALAAAAJFdlZWtseSBpbnRlcmVzdCByYXRlIGluIGJhc2lzIHBvaW50cwAAAA1pbnRlcmVzdF9yYXRlAAAAAAAABAAAABtXaGV0aGVyIHRoaXMgbG9hbiBpcyBhY3RpdmUAAAAACWlzX2FjdGl2ZQAAAAAAAAEAAAAeTGFzdCB0aW1lIGludGVyZXN0IHdhcyB1cGRhdGVkAAAAAAAUbGFzdF9pbnRlcmVzdF91cGRhdGUAAAAGAAAAFUFkZHJlc3Mgb2YgdGhlIGxlbmRlcgAAAAAAAAZsZW5kZXIAAAAAABMAAAAlTGlxdWlkYXRpb24gdGhyZXNob2xkIGluIGJhc2lzIHBvaW50cwAAAAAAABVsaXF1aWRhdGlvbl90aHJlc2hvbGQAAAAAAAAEAAAAH1VuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGlzIGxvYW4AAAAAB2xvYW5faWQAAAAABgAAAB9SZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsIG9mZmVyAAAAAAhvZmZlcl9pZAAAAAYAAAAfVGltZXN0YW1wIHdoZW4gbG9hbiB3YXMgY3JlYXRlZAAAAAAKc3RhcnRfdGltZQAAAAAABg==",
        "AAAAAQAAAB1IZWFsdGggaW5mb3JtYXRpb24gZm9yIGEgbG9hbgAAAAAAAAAAAAAKTG9hbkhlYWx0aAAAAAAABwAAADJDdXJyZW50IGNvbGxhdGVyYWwgdmFsdWUgaW4gVVNEQyAod2l0aCA3IGRlY2ltYWxzKQAAAAAAFGNvbGxhdGVyYWxfdmFsdWVfdXNkAAAACwAAACdDb2xsYXRlcmFsaXphdGlvbiByYXRpbyBpbiBiYXNpcyBwb2ludHMAAAAAF2NvbGxhdGVyYWxpemF0aW9uX3JhdGlvAAAAAAQAAAA9VG90YWwgZGVidCBpbmNsdWRpbmcgcHJpbmNpcGFsIGFuZCBpbnRlcmVzdCAod2l0aCA3IGRlY2ltYWxzKQAAAAAAAA5kZWJ0X3ZhbHVlX3VzZAAAAAAACwAAACxIZWFsdGggZmFjdG9yIGluIGJhc2lzIHBvaW50cyAoMTAwMDAgPSAxMDAlKQAAAA1oZWFsdGhfZmFjdG9yAAAAAAAABAAAACNXaGV0aGVyIHRoaXMgbG9hbiBjYW4gYmUgbGlxdWlkYXRlZAAAAAAPaXNfbGlxdWlkYXRhYmxlAAAAAAEAAAA/WExNIHByaWNlIHRoYXQgd291bGQgdHJpZ2dlciBsaXF1aWRhdGlvbiAod2l0aCBvcmFjbGUgZGVjaW1hbHMpAAAAABFsaXF1aWRhdGlvbl9wcmljZQAAAAAAAAsAAAAPTG9hbiBpZGVudGlmaWVyAAAAAAdsb2FuX2lkAAAAAAY=",
        "AAAAAgAAACBTb3J0IG9wdGlvbnMgZm9yIHF1ZXJ5aW5nIG9mZmVycwAAAAAAAAAKU29ydE9wdGlvbgAAAAAAAwAAAAAAAAAjU29ydCBieSBiZXN0IChsb3dlc3QpIGludGVyZXN0IHJhdGUAAAAACEJlc3RSYXRlAAAAAAAAACBTb3J0IGJ5IGhpZ2hlc3QgYW1vdW50IGF2YWlsYWJsZQAAAA1IaWdoZXN0QW1vdW50AAAAAAAAAAAAABRTb3J0IGJ5IG5ld2VzdCBmaXJzdAAAAAZOZXdlc3QAAA==",
        "AAAAAgAAAB1TdG9yYWdlIGtleXMgZm9yIHRoZSBjb250cmFjdAAAAAAAAAAAAAAHRGF0YUtleQAAAAAQAAAAAAAAABZDb250cmFjdCBhZG1pbmlzdHJhdG9yAAAAAAAFQWRtaW4AAAAAAAAAAAAAElVTREMgdG9rZW4gYWRkcmVzcwAAAAAACVVzZGNUb2tlbgAAAAAAAAAAAAAaWExNIHRva2VuIGFkZHJlc3MgKG5hdGl2ZSkAAAAAAAhYbG1Ub2tlbgAAAAAAAAAhUmVmbGVjdG9yIG9yYWNsZSBjb250cmFjdCBhZGRyZXNzAAAAAAAADU9yYWNsZUFkZHJlc3MAAAAAAAAAAAAAFU5leHQgb2ZmZXIgSUQgY291bnRlcgAAAAAAAAtOZXh0T2ZmZXJJZAAAAAAAAAAAFE5leHQgbG9hbiBJRCBjb3VudGVyAAAACk5leHRMb2FuSWQAAAAAAAAAAABATWF4aW11bSBhbGxvd2VkIGludGVyZXN0IHJhdGUgaW4gYmFzaXMgcG9pbnRzIChlLmcuLCAzMDAwID0gMzAlKQAAAA9NYXhJbnRlcmVzdFJhdGUAAAAAAAAAABVDb250cmFjdCBwYXVzZWQgc3RhdGUAAAAAAAAISXNQYXVzZWQAAAAAAAAAD1JlZW50cmFuY3kgbG9jawAAAAAGTG9ja2VkAAAAAAABAAAAFkluZGl2aWR1YWwgb2ZmZXIgYnkgSUQAAAAAAAVPZmZlcgAAAAAAAAEAAAAGAAAAAQAAABVJbmRpdmlkdWFsIGxvYW4gYnkgSUQAAAAAAAAETG9hbgAAAAEAAAAGAAAAAQAAABxMaXN0IG9mIG9mZmVyIElEcyBmb3IgYSB1c2VyAAAAClVzZXJPZmZlcnMAAAAAAAEAAAATAAAAAQAAACdMaXN0IG9mIGxvYW4gSURzIHdoZXJlIHVzZXIgaXMgYm9ycm93ZXIAAAAAE1VzZXJMb2Fuc0FzQm9ycm93ZXIAAAAAAQAAABMAAAABAAAAJUxpc3Qgb2YgbG9hbiBJRHMgd2hlcmUgdXNlciBpcyBsZW5kZXIAAAAAAAARVXNlckxvYW5zQXNMZW5kZXIAAAAAAAABAAAAEwAAAAAAAAAcTGlzdCBvZiBhbGwgYWN0aXZlIG9mZmVyIElEcwAAAAxBY3RpdmVPZmZlcnMAAAAAAAAAG0xpc3Qgb2YgYWxsIGFjdGl2ZSBsb2FuIElEcwAAAAALQWN0aXZlTG9hbnMA",
        "AAAAAQAAABZQcmljZSBkYXRhIGZyb20gb3JhY2xlAAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAALUHJpY2UgdmFsdWUAAAAABXByaWNlAAAAAAAACwAAABZUaW1lc3RhbXAgb2YgdGhlIHByaWNlAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
      ]),
      options,
    );
    this.options = options;
  }
  fromJSON = {
    create_offer: this.txFromJSON,
    cancel_offer: this.txFromJSON,
    withdraw_from_offer: this.txFromJSON,
    borrow: this.txFromJSON,
    repay: this.txFromJSON,
    add_collateral: this.txFromJSON,
    withdraw_collateral: this.txFromJSON,
    is_liquidatable: this.txFromJSON,
    liquidate: this.txFromJSON,
    batch_check_liquidations: this.txFromJSON,
    get_offer: this.txFromJSON,
    get_loan: this.txFromJSON,
    get_loan_health: this.txFromJSON,
    calculate_interest: this.txFromJSON,
    get_xlm_price: this.txFromJSON,
    get_user_offers: this.txFromJSON,
    get_user_loans_as_borrower: this.txFromJSON,
    get_user_loans_as_lender: this.txFromJSON,
    get_active_offers: this.txFromJSON,
    get_active_loans: this.txFromJSON,
    set_max_interest_rate: this.txFromJSON,
    set_oracle_address: this.txFromJSON,
    pause_contract: this.txFromJSON,
    unpause_contract: this.txFromJSON,
    admin: this.txFromJSON,
  };
}
