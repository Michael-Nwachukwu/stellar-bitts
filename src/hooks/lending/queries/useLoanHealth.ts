import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";

export interface LoanHealth {
  collateral_value_usdc: bigint;
  total_debt: bigint;
  collateralization_ratio: number;
  health_factor: number;
  is_liquidatable: boolean;
  liquidation_price: bigint;
}

/**
 * Hook to fetch real-time loan health metrics
 * Updates more frequently than regular loan data
 * @param loanId - The loan ID to monitor
 * @returns Query result with health data
 */
export function useLoanHealth(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan-health", loanId],
    queryFn: async () => {
      if (!loanId) throw new Error("Loan ID is required");

      const healthResult = await lendingMarket.get_loan_health({
        loan_id: BigInt(loanId),
      });

      if (!healthResult.result) {
        throw new Error("Failed to fetch loan health");
      }

      return healthResult.result.unwrap() as LoanHealth;
    },
    enabled: !!loanId,
    staleTime: 5000, // 5 seconds - very frequent for health monitoring
    refetchInterval: 10000, // Auto-refetch every 10 seconds
    retry: 2,
  });
}
