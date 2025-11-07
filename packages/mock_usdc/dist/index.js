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
    contractId: "CAL3G6QN5LOABYFD4MJUOTBNB6VOBI5IKXZRH5YFRYV27PPG6N7BFHT3",
  },
};
export class Client extends ContractClient {
  options;
  static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { admin, decimal, name, symbol },
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options,
  ) {
    return ContractClient.deploy({ admin, decimal, name, symbol }, options);
  }
  constructor(options) {
    super(
      new ContractSpec([
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABwAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAIRGVjaW1hbHMAAAAAAAAAAAAAAAROYW1lAAAAAAAAAAAAAAAGU3ltYm9sAAAAAAAAAAAAAAAAAAtUb3RhbFN1cHBseQAAAAABAAAAAAAAAAdCYWxhbmNlAAAAAAEAAAATAAAAAQAAAAAAAAAJQWxsb3dhbmNlAAAAAAAAAgAAABMAAAAT",
        "AAAAAAAAADBJbml0aWFsaXplIHRoZSB0b2tlbiB3aXRoIG1ldGFkYXRhIChjb25zdHJ1Y3RvcikAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAHZGVjaW1hbAAAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAGc3ltYm9sAAAAAAAQAAAAAA==",
        "AAAAAAAAABpNaW50IHRva2VucyB0byBhIHJlY2lwaWVudAAAAAAABG1pbnQAAAACAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAABFHZXQgdG9rZW4gYmFsYW5jZQAAAAAAAAdiYWxhbmNlAAAAAAEAAAAAAAAAAmlkAAAAAAATAAAAAQAAAAs=",
        "AAAAAAAAAA9UcmFuc2ZlciB0b2tlbnMAAAAACHRyYW5zZmVyAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAADlUcmFuc2ZlciB0b2tlbnMgZnJvbSBhbm90aGVyIGFjY291bnQgKHJlcXVpcmVzIGFsbG93YW5jZSkAAAAAAAANdHJhbnNmZXJfZnJvbQAAAAAAAAQAAAAAAAAAB3NwZW5kZXIAAAAAEwAAAAAAAAAEZnJvbQAAABMAAAAAAAAAAnRvAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
        "AAAAAAAAAB9BcHByb3ZlIHNwZW5kZXIgdG8gc3BlbmQgdG9rZW5zAAAAAAdhcHByb3ZlAAAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAAdzcGVuZGVyAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAARZXhwaXJhdGlvbl9sZWRnZXIAAAAAAAAEAAAAAA==",
        "AAAAAAAAAA1HZXQgYWxsb3dhbmNlAAAAAAAACWFsbG93YW5jZQAAAAAAAAIAAAAAAAAABGZyb20AAAATAAAAAAAAAAdzcGVuZGVyAAAAABMAAAABAAAACw==",
        "AAAAAAAAABJHZXQgdG9rZW4gbWV0YWRhdGEAAAAAAAhkZWNpbWFscwAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAEbmFtZQAAAAAAAAABAAAAEA==",
        "AAAAAAAAAAAAAAAGc3ltYm9sAAAAAAAAAAAAAQAAABA=",
      ]),
      options,
    );
    this.options = options;
  }
  fromJSON = {
    mint: this.txFromJSON,
    balance: this.txFromJSON,
    transfer: this.txFromJSON,
    transfer_from: this.txFromJSON,
    approve: this.txFromJSON,
    allowance: this.txFromJSON,
    decimals: this.txFromJSON,
    name: this.txFromJSON,
    symbol: this.txFromJSON,
  };
}
