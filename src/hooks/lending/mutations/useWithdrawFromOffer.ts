import { useMutation, useQueryClient } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";
import { parseUsdc } from "@/lib/lending-utils";

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
  const { address } = useWallet();

  return useMutation({
    mutationFn: async (params: WithdrawFromOfferParams) => {
      if (!address) throw new Error("Wallet not connected");

      const withdrawAmount = parseUsdc(params.amount);
      const offerId = BigInt(params.offerId);

      // Withdraw from offer (returns USDC to lender)
      const { result } = await lendingMarket.withdraw_from_offer({
        lender: address,
        offer_id: offerId,
        amount: withdrawAmount,
      });

      return result;
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
