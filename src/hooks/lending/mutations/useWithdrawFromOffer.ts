import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { parseUsdc } from "@/lib/lending-utils";
import { useContractClients } from "../useContractClients";

export interface WithdrawFromOfferParams {
  offerId: string; // Offer ID to withdraw from
  amount: string; // Human-readable USDC amount like "1000.00"
}

/**
 * Hook to withdraw partial USDC from an active offer
 * Reduces offer's available amount without canceling
 * No token approval needed (receiving tokens back)
 * @returns Mutation hook with loading state
 */
export function useWithdrawFromOffer() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { lendingMarket } = useContractClients();

  return useMutation({
    mutationFn: async (params: WithdrawFromOfferParams) => {
      if (!address) throw new Error("Wallet not connected");

      const withdrawAmount = parseUsdc(params.amount);
      const offerId = BigInt(params.offerId);

      // Withdraw from offer (returns USDC to lender)
      const withdrawTx = await lendingMarket.withdraw_from_offer({
        lender: address,
        offer_id: offerId,
        amount: withdrawAmount,
      });

      const sentTx = await withdrawTx.signAndSend({ signTransaction });
      if (!sentTx.result) throw new Error("Failed to withdraw from offer");
      return sentTx.result.unwrap();
    },
    onSuccess: async (_, variables) => {
      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["offer", variables.offerId],
        }),
        queryClient.invalidateQueries({ queryKey: ["user-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["active-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
