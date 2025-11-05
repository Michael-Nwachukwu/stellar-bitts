import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "../useContractClients";
import { parseUsdc, parseXlm } from "@/lib/lending-utils";

export interface BorrowParams {
  offerId: string; // Offer ID to borrow from
  collateralXlm: string; // Human-readable XLM amount like "1000.00"
  borrowAmount: string; // Human-readable USDC amount like "100.00"
}

/**
 * Hook to borrow USDC using XLM collateral
 * Handles XLM approval + contract call
 * @returns Mutation hook with loading state and loan_id on success
 */
export function useBorrow() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { lendingMarket } = useContractClients();

  return useMutation({
    mutationFn: async (params: BorrowParams) => {
      if (!address) throw new Error("Wallet not connected");

      const collateralAmount = parseXlm(params.collateralXlm);
      const borrowAmount = parseUsdc(params.borrowAmount);
      const offerId = BigInt(params.offerId);

      // Note: XLM collateral approval is handled by the SDK/wallet
      // during transaction signing, so we don't need explicit approval

      // Borrow from offer
      const borrowTx = await lendingMarket.borrow({
        borrower: address,
        offer_id: offerId,
        collateral_amount: collateralAmount,
        borrow_amount: borrowAmount,
      });

      // Sign and send the transaction
      const sentTx = await borrowTx.signAndSend({ signTransaction });

      if (!sentTx.result) {
        throw new Error("Failed to borrow from offer");
      }

      return sentTx.result.unwrap(); // Returns loan_id
    },
    onSuccess: async () => {
      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-loans-borrower"] }),
        queryClient.invalidateQueries({ queryKey: ["active-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
