import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
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
    contractId: "CBR62MIRODL66RVS4OPURXAVARF6H2EW5VFQSOB6W3G23WUWK7ZQRNGM",
  },
} as const;

/**
 * Quoted asset definition (matches Reflector interface)
 */
export type Asset =
  | { tag: "Stellar"; values: readonly [string] }
  | { tag: "Other"; values: readonly [string] };

/**
 * Price record definition (matches Reflector interface)
 */
export interface PriceData {
  /**
   * Asset price at given point in time
   */
  price: i128;
  /**
   * Record timestamp
   */
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a base transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Base oracle symbol the price is reported in (USDC)
   */
  base: (options?: {
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
  }) => Promise<AssembledTransaction<Asset>>;

  /**
   * Construct and simulate a assets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * All assets quoted by the contract (just XLM for now)
   */
  assets: (options?: {
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
  }) => Promise<AssembledTransaction<Array<Asset>>>;

  /**
   * Construct and simulate a decimals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Number of decimal places used to represent price
   * Reflector uses 14 decimals
   */
  decimals: (options?: {
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
  }) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes asset price in base asset at specific timestamp
   * For mock: always returns same price regardless of timestamp
   */
  price: (
    { asset, timestamp }: { asset: Asset; timestamp: u64 },
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
  ) => Promise<AssembledTransaction<Option<PriceData>>>;

  /**
   * Construct and simulate a lastprice transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes the most recent price for an asset (XLM/USDC)
   * Returns fixed price: $0.15 per XLM
   */
  lastprice: (
    { asset }: { asset: Asset },
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
  ) => Promise<AssembledTransaction<Option<PriceData>>>;

  /**
   * Construct and simulate a prices transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes last N price records for the given asset
   * For mock: returns same price N times
   */
  prices: (
    { asset, records }: { asset: Asset; records: u32 },
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
  ) => Promise<AssembledTransaction<Option<Array<PriceData>>>>;

  /**
   * Construct and simulate a x_last_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes the most recent cross price record for the pair of assets
   */
  x_last_price: (
    { base_asset, quote_asset }: { base_asset: Asset; quote_asset: Asset },
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
  ) => Promise<AssembledTransaction<Option<PriceData>>>;

  /**
   * Construct and simulate a x_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes the cross price for the pair of assets at specific timestamp
   */
  x_price: (
    {
      base_asset,
      quote_asset,
      timestamp,
    }: { base_asset: Asset; quote_asset: Asset; timestamp: u64 },
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
  ) => Promise<AssembledTransaction<Option<PriceData>>>;

  /**
   * Construct and simulate a x_prices transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes last N cross price records of for the pair of assets
   */
  x_prices: (
    {
      base_asset,
      quote_asset,
      records,
    }: { base_asset: Asset; quote_asset: Asset; records: u32 },
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
  ) => Promise<AssembledTransaction<Option<Array<PriceData>>>>;

  /**
   * Construct and simulate a twap transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes the time-weighted average price for the given asset over N recent records
   */
  twap: (
    { asset, records }: { asset: Asset; records: u32 },
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
  ) => Promise<AssembledTransaction<Option<i128>>>;

  /**
   * Construct and simulate a x_twap transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Quotes the time-weighted average cross price for the given asset pair over N recent records
   */
  x_twap: (
    {
      base_asset,
      quote_asset,
      records,
    }: { base_asset: Asset; quote_asset: Asset; records: u32 },
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
  ) => Promise<AssembledTransaction<Option<i128>>>;

  /**
   * Construct and simulate a resolution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Price feed resolution (default tick period timeframe, in seconds - 5 minutes)
   */
  resolution: (options?: {
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
  }) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Historical records retention period, in seconds (24 hours)
   */
  period: (options?: {
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
  }) => Promise<AssembledTransaction<Option<u64>>>;

  /**
   * Construct and simulate a last_timestamp transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The most recent price update timestamp
   */
  last_timestamp: (options?: {
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
  }) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a version transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Contract protocol version
   */
  version: (options?: {
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
  }) => Promise<AssembledTransaction<u32>>;

  /**
   * Construct and simulate a admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Contract admin address
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
  }) => Promise<AssembledTransaction<Option<string>>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
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
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAgAAADVRdW90ZWQgYXNzZXQgZGVmaW5pdGlvbiAobWF0Y2hlcyBSZWZsZWN0b3IgaW50ZXJmYWNlKQAAAAAAAAAAAAAFQXNzZXQAAAAAAAACAAAAAQAAACZGb3IgU3RlbGxhciBDbGFzc2ljIGFuZCBTb3JvYmFuIGFzc2V0cwAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAMUZvciBhbnkgZXh0ZXJuYWwgY3VycmVuY2llcy90b2tlbnMvYXNzZXRzL3N5bWJvbHMAAAAAAAAFT3RoZXIAAAAAAAABAAAAEQ==",
        "AAAAAQAAADVQcmljZSByZWNvcmQgZGVmaW5pdGlvbiAobWF0Y2hlcyBSZWZsZWN0b3IgaW50ZXJmYWNlKQAAAAAAAAAAAAAJUHJpY2VEYXRhAAAAAAAAAgAAACJBc3NldCBwcmljZSBhdCBnaXZlbiBwb2ludCBpbiB0aW1lAAAAAAAFcHJpY2UAAAAAAAALAAAAEFJlY29yZCB0aW1lc3RhbXAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAAAAADJCYXNlIG9yYWNsZSBzeW1ib2wgdGhlIHByaWNlIGlzIHJlcG9ydGVkIGluIChVU0RDKQAAAAAABGJhc2UAAAAAAAAAAQAAB9AAAAAFQXNzZXQAAAA=",
        "AAAAAAAAADRBbGwgYXNzZXRzIHF1b3RlZCBieSB0aGUgY29udHJhY3QgKGp1c3QgWExNIGZvciBub3cpAAAABmFzc2V0cwAAAAAAAAAAAAEAAAPqAAAH0AAAAAVBc3NldAAAAA==",
        "AAAAAAAAAEtOdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdXNlZCB0byByZXByZXNlbnQgcHJpY2UKUmVmbGVjdG9yIHVzZXMgMTQgZGVjaW1hbHMAAAAACGRlY2ltYWxzAAAAAAAAAAEAAAAE",
        "AAAAAAAAAHJRdW90ZXMgYXNzZXQgcHJpY2UgaW4gYmFzZSBhc3NldCBhdCBzcGVjaWZpYyB0aW1lc3RhbXAKRm9yIG1vY2s6IGFsd2F5cyByZXR1cm5zIHNhbWUgcHJpY2UgcmVnYXJkbGVzcyBvZiB0aW1lc3RhbXAAAAAAAAVwcmljZQAAAAAAAAIAAAAAAAAABWFzc2V0AAAAAAAH0AAAAAVBc3NldAAAAAAAAAAAAAAJdGltZXN0YW1wAAAAAAAABgAAAAEAAAPoAAAH0AAAAAlQcmljZURhdGEAAAA=",
        "AAAAAAAAAFdRdW90ZXMgdGhlIG1vc3QgcmVjZW50IHByaWNlIGZvciBhbiBhc3NldCAoWExNL1VTREMpClJldHVybnMgZml4ZWQgcHJpY2U6ICQwLjE1IHBlciBYTE0AAAAACWxhc3RwcmljZQAAAAAAAAEAAAAAAAAABWFzc2V0AAAAAAAH0AAAAAVBc3NldAAAAAAAAAEAAAPoAAAH0AAAAAlQcmljZURhdGEAAAA=",
        "AAAAAAAAAFRRdW90ZXMgbGFzdCBOIHByaWNlIHJlY29yZHMgZm9yIHRoZSBnaXZlbiBhc3NldApGb3IgbW9jazogcmV0dXJucyBzYW1lIHByaWNlIE4gdGltZXMAAAAGcHJpY2VzAAAAAAACAAAAAAAAAAVhc3NldAAAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAB3JlY29yZHMAAAAABAAAAAEAAAPoAAAD6gAAB9AAAAAJUHJpY2VEYXRhAAAA",
        "AAAAAAAAAEBRdW90ZXMgdGhlIG1vc3QgcmVjZW50IGNyb3NzIHByaWNlIHJlY29yZCBmb3IgdGhlIHBhaXIgb2YgYXNzZXRzAAAADHhfbGFzdF9wcmljZQAAAAIAAAAAAAAACmJhc2VfYXNzZXQAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAC3F1b3RlX2Fzc2V0AAAAB9AAAAAFQXNzZXQAAAAAAAABAAAD6AAAB9AAAAAJUHJpY2VEYXRhAAAA",
        "AAAAAAAAAENRdW90ZXMgdGhlIGNyb3NzIHByaWNlIGZvciB0aGUgcGFpciBvZiBhc3NldHMgYXQgc3BlY2lmaWMgdGltZXN0YW1wAAAAAAd4X3ByaWNlAAAAAAMAAAAAAAAACmJhc2VfYXNzZXQAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAC3F1b3RlX2Fzc2V0AAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAYAAAABAAAD6AAAB9AAAAAJUHJpY2VEYXRhAAAA",
        "AAAAAAAAADtRdW90ZXMgbGFzdCBOIGNyb3NzIHByaWNlIHJlY29yZHMgb2YgZm9yIHRoZSBwYWlyIG9mIGFzc2V0cwAAAAAIeF9wcmljZXMAAAADAAAAAAAAAApiYXNlX2Fzc2V0AAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAtxdW90ZV9hc3NldAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAdyZWNvcmRzAAAAAAQAAAABAAAD6AAAA+oAAAfQAAAACVByaWNlRGF0YQAAAA==",
        "AAAAAAAAAFBRdW90ZXMgdGhlIHRpbWUtd2VpZ2h0ZWQgYXZlcmFnZSBwcmljZSBmb3IgdGhlIGdpdmVuIGFzc2V0IG92ZXIgTiByZWNlbnQgcmVjb3JkcwAAAAR0d2FwAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAdyZWNvcmRzAAAAAAQAAAABAAAD6AAAAAs=",
        "AAAAAAAAAFtRdW90ZXMgdGhlIHRpbWUtd2VpZ2h0ZWQgYXZlcmFnZSBjcm9zcyBwcmljZSBmb3IgdGhlIGdpdmVuIGFzc2V0IHBhaXIgb3ZlciBOIHJlY2VudCByZWNvcmRzAAAAAAZ4X3R3YXAAAAAAAAMAAAAAAAAACmJhc2VfYXNzZXQAAAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAC3F1b3RlX2Fzc2V0AAAAB9AAAAAFQXNzZXQAAAAAAAAAAAAAB3JlY29yZHMAAAAABAAAAAEAAAPoAAAACw==",
        "AAAAAAAAAE1QcmljZSBmZWVkIHJlc29sdXRpb24gKGRlZmF1bHQgdGljayBwZXJpb2QgdGltZWZyYW1lLCBpbiBzZWNvbmRzIC0gNSBtaW51dGVzKQAAAAAAAApyZXNvbHV0aW9uAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAADpIaXN0b3JpY2FsIHJlY29yZHMgcmV0ZW50aW9uIHBlcmlvZCwgaW4gc2Vjb25kcyAoMjQgaG91cnMpAAAAAAAGcGVyaW9kAAAAAAAAAAAAAQAAA+gAAAAG",
        "AAAAAAAAACZUaGUgbW9zdCByZWNlbnQgcHJpY2UgdXBkYXRlIHRpbWVzdGFtcAAAAAAADmxhc3RfdGltZXN0YW1wAAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAABlDb250cmFjdCBwcm90b2NvbCB2ZXJzaW9uAAAAAAAAB3ZlcnNpb24AAAAAAAAAAAEAAAAE",
        "AAAAAAAAABZDb250cmFjdCBhZG1pbiBhZGRyZXNzAAAAAAAFYWRtaW4AAAAAAAAAAAAAAQAAA+gAAAAT",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    base: this.txFromJSON<Asset>,
    assets: this.txFromJSON<Array<Asset>>,
    decimals: this.txFromJSON<u32>,
    price: this.txFromJSON<Option<PriceData>>,
    lastprice: this.txFromJSON<Option<PriceData>>,
    prices: this.txFromJSON<Option<Array<PriceData>>>,
    x_last_price: this.txFromJSON<Option<PriceData>>,
    x_price: this.txFromJSON<Option<PriceData>>,
    x_prices: this.txFromJSON<Option<Array<PriceData>>>,
    twap: this.txFromJSON<Option<i128>>,
    x_twap: this.txFromJSON<Option<i128>>,
    resolution: this.txFromJSON<u32>,
    period: this.txFromJSON<Option<u64>>,
    last_timestamp: this.txFromJSON<u64>,
    version: this.txFromJSON<u32>,
    admin: this.txFromJSON<Option<string>>,
  };
}
