import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";

/**
 * Hook to fetch all active offers from the marketplace
 * @returns Query result with array of offer IDs
 */
export function useActiveOffers() {
  return useQuery({
    queryKey: ["active-offers"],
    queryFn: async () => {
      const { result } = await lendingMarket.get_active_offers();

      return result || [];
    },
    staleTime: 20000, // 20 seconds
    retry: 2,
  });
}

/**
 * Hook to fetch all active loans
 * @returns Query result with array of loan IDs
 */
export function useActiveLoans() {
  return useQuery({
    queryKey: ["active-loans"],
    queryFn: async () => {
      const { result } = await lendingMarket.get_active_loans();

      return result || [];
    },
    staleTime: 20000, // 20 seconds
    retry: 2,
  });
}
