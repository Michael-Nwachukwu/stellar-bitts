import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";

export interface Loan {
  loan_id: bigint;
  offer_id: bigint;
  borrower: string;
  lender: string;
  collateral_amount: bigint;
  borrowed_amount: bigint;
  interest_rate: number;
  start_time: bigint;
  last_interest_update: bigint;
  accumulated_interest: bigint;
  liquidation_threshold: number;
  is_active: boolean;
}

/**
 * Hook to fetch a single loan by ID
 * @param loanId - The loan ID to fetch
 * @returns Query result with loan data
 */
export function useLoan(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: async () => {
      if (!loanId) throw new Error("Loan ID is required");

      const loanResult = await lendingMarket.get_loan({
        loan_id: BigInt(loanId),
      });

      if (!loanResult.result) {
        throw new Error("Failed to fetch loan");
      }

      return loanResult.result.unwrap() as Loan;
    },
    enabled: !!loanId,
    staleTime: 10000, // 10 seconds - more frequent updates for loans
    retry: 2,
  });
}
