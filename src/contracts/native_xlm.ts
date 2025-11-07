/**
 * Native XLM Token Contract Client
 * Wrapped Stellar native asset (XLM) as SAC token
 *
 * Note: This is a placeholder. In practice, XLM approval is handled
 * automatically by the Stellar SDK when building transactions for
 * contracts that need XLM collateral.
 */

// Native XLM contract address on Stellar
const NATIVE_XLM_ADDRESS =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export interface XlmApproveParams {
  from: string;
  spender: string;
  amount: bigint;
  expiration_ledger: number;
}

/**
 * Simple wrapper for native XLM token (SAC)
 * Note: Approval is handled by wallet/SDK during transaction signing
 */
const nativeXlmClient = {
  options: {
    contractId: NATIVE_XLM_ADDRESS,
  },

  /**
   * Approve spender to use XLM tokens
   * This is a placeholder - actual approval happens during transaction signing
   */
  async approve(_params: XlmApproveParams) {
    // Approval will be handled by the Stellar SDK transaction building
    // and wallet signing process, not explicitly here
    return {
      result: true,
    };
  },

  /**
   * Get allowance (placeholder)
   */
  async allowance(_from: string, _spender: string): Promise<bigint> {
    return BigInt(0);
  },

  /**
   * Get balance (placeholder)
   */
  async balance(_address: string): Promise<bigint> {
    return BigInt(0);
  },
};

export default nativeXlmClient;
