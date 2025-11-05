import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";

export interface LendingOffer {
  offer_id: bigint;
  lender: string;
  usdc_amount: bigint;
  weekly_interest_rate: number;
  min_collateral_ratio: number;
  liquidation_threshold: number;
  max_duration_weeks: number;
  is_active: boolean;
  created_at: bigint;
}

/**
 * Hook to fetch a single lending offer by ID
 * @param offerId - The offer ID to fetch
 * @returns Query result with offer data
 */
export function useOffer(offerId: string | undefined) {
  return useQuery({
    queryKey: ["offer", offerId],
    queryFn: async () => {
      if (!offerId) throw new Error("Offer ID is required");

      const offerResult = await lendingMarket.get_offer({
        offer_id: BigInt(offerId),
      });

      if (!offerResult.result) {
        throw new Error("Failed to fetch offer");
      }

      return offerResult.result.unwrap() as LendingOffer;
    },
    enabled: !!offerId,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}
