import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";

/**
 * Hook to fetch current XLM price from oracle
 * Returns price with 14 decimals (Reflector standard)
 * @returns Query result with price as u128
 */
export function useXlmPrice() {
  return useQuery({
    queryKey: ["xlm-price"],
    queryFn: async () => {
      const priceResult = await lendingMarket.get_xlm_price();

      if (!priceResult.result) {
        throw new Error("Failed to fetch XLM price");
      }

      // Unwrap the result to get the actual u128 value
      return priceResult.result.unwrap();
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Auto-refetch every minute
    retry: 3,
  });
}

/**
 * Convert XLM price from contract format to decimal for display
 * @param price - Price from contract (14 decimals)
 * @returns Price as decimal number (e.g., 0.15)
 */
export function formatXlmPrice(price: bigint | undefined): number {
  if (!price) return 0;
  return Number(price) / 1e14; // 14 decimals
}
