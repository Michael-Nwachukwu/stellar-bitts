import { useQueries, useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";
import type { LendingOffer } from "./useOffer";

/**
 * Hook to fetch all active offers with full data from the marketplace
 * @returns Query result with array of full offer objects
 */
export function useActiveOffersWithData() {
  // First, get all offer IDs
  const { data: offerIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ["active-offers"],
    queryFn: async () => {
      const { result } = await lendingMarket.get_active_offers();
      return result || [];
    },
    staleTime: 20000,
    retry: 2,
  });

  // Then fetch each offer's full data
  const offerQueries = useQueries({
    queries: offerIds.map((offerId: bigint) => ({
      queryKey: ["offer", offerId.toString()],
      queryFn: async () => {
        const offerResult = await lendingMarket.get_offer({
          offer_id: offerId,
        });

        if (!offerResult.result) {
          return null;
        }

        return offerResult.result.unwrap() as LendingOffer;
      },
      staleTime: 30000,
      retry: 2,
    })),
  });

  const isLoading = isLoadingIds || offerQueries.some((q) => q.isLoading);
  const offers = offerQueries
    .map((q) => q.data)
    .filter(
      (offer): offer is LendingOffer => offer !== null && offer !== undefined,
    );

  return {
    data: offers,
    isLoading,
    isError: offerQueries.some((q) => q.isError),
  };
}

/**
 * Hook to fetch all offers created by the user with full data
 * @returns Query result with array of full offer objects
 */
export function useUserOffersWithData() {
  const { address } = useWallet();

  // First, get user's offer IDs
  const { data: offerIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ["user-offers", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_offers({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000,
    retry: 2,
  });

  // Then fetch each offer's full data
  const offerQueries = useQueries({
    queries: offerIds.map((offerId: bigint) => ({
      queryKey: ["offer", offerId.toString()],
      queryFn: async () => {
        const offerResult = await lendingMarket.get_offer({
          offer_id: offerId,
        });

        if (!offerResult.result) {
          return null;
        }

        return offerResult.result.unwrap() as LendingOffer;
      },
      enabled: !!address,
      staleTime: 30000,
      retry: 2,
    })),
  });

  const isLoading = isLoadingIds || offerQueries.some((q) => q.isLoading);
  const offers = offerQueries
    .map((q) => q.data)
    .filter(
      (offer): offer is LendingOffer => offer !== null && offer !== undefined,
    );

  return {
    data: offers,
    isLoading,
    isError: offerQueries.some((q) => q.isError),
  };
}
