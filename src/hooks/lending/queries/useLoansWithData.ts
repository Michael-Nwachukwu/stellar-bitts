import { useQueries, useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";
import type { Loan } from "./useLoan";

/**
 * Hook to fetch all loans where user is the borrower with full data
 * @returns Query result with array of full loan objects
 */
export function useUserLoansAsBorrowerWithData() {
  const { address } = useWallet();

  // First, get loan IDs
  const { data: loanIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ["user-loans-borrower", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_loans_as_borrower({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000,
    retry: 2,
  });

  // Then fetch each loan's full data
  const loanQueries = useQueries({
    queries: loanIds.map((loanId: bigint) => ({
      queryKey: ["loan", loanId.toString()],
      queryFn: async () => {
        const loanResult = await lendingMarket.get_loan({
          loan_id: loanId,
        });

        if (!loanResult.result) {
          return null;
        }

        return loanResult.result.unwrap() as Loan;
      },
      enabled: !!address,
      staleTime: 10000,
      retry: 2,
    })),
  });

  const isLoading = isLoadingIds || loanQueries.some((q) => q.isLoading);
  const loans = loanQueries
    .map((q) => q.data)
    .filter((loan): loan is Loan => loan !== null && loan !== undefined);

  return {
    data: loans,
    isLoading,
    isError: loanQueries.some((q) => q.isError),
  };
}

/**
 * Hook to fetch all loans where user is the lender with full data
 * @returns Query result with array of full loan objects
 */
export function useUserLoansAsLenderWithData() {
  const { address } = useWallet();

  // First, get loan IDs
  const { data: loanIds = [], isLoading: isLoadingIds } = useQuery({
    queryKey: ["user-loans-lender", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { result } = await lendingMarket.get_user_loans_as_lender({
        user: address,
      });

      return result || [];
    },
    enabled: !!address,
    staleTime: 15000,
    retry: 2,
  });

  // Then fetch each loan's full data
  const loanQueries = useQueries({
    queries: loanIds.map((loanId: bigint) => ({
      queryKey: ["loan", loanId.toString()],
      queryFn: async () => {
        const loanResult = await lendingMarket.get_loan({
          loan_id: loanId,
        });

        if (!loanResult.result) {
          return null;
        }

        return loanResult.result.unwrap() as Loan;
      },
      enabled: !!address,
      staleTime: 10000,
      retry: 2,
    })),
  });

  const isLoading = isLoadingIds || loanQueries.some((q) => q.isLoading);
  const loans = loanQueries
    .map((q) => q.data)
    .filter((loan): loan is Loan => loan !== null && loan !== undefined);

  return {
    data: loans,
    isLoading,
    isError: loanQueries.some((q) => q.isError),
  };
}
