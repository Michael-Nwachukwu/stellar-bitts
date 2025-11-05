import { useMutation, useQueryClient } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";

export interface CancelOfferParams {
  offerId: string; // Offer ID to cancel
}

/**
 * Hook to cancel an active lending offer
 * Returns unused USDC to the lender
 * No token approval needed (receiving tokens back)
 * @returns Mutation hook with loading state
 */
export function useCancelOffer() {
  const queryClient = useQueryClient();
  const { address } = useWallet();

  return useMutation({
    mutationFn: async (params: CancelOfferParams) => {
      if (!address) throw new Error("Wallet not connected");

      const offerId = BigInt(params.offerId);

      // Cancel offer (returns USDC to lender)
      const { result } = await lendingMarket.cancel_offer({
        lender: address,
        offer_id: offerId,
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
