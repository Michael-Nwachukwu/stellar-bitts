import { useQuery } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import { useWallet } from "@/hooks/useWallet";
import { formatUsdc } from "@/lib/lending-utils";

export interface DashboardStats {
  // Borrowing stats
  totalBorrowed: string; // Formatted USDC
  totalBorrowedRaw: bigint;
  totalBorrowedInterest: string;
  totalBorrowedInterestRaw: bigint;
  borrowerLoansCount: number;

  // Lending stats
  totalLent: string; // Formatted USDC
  totalLentRaw: bigint;
  totalEarnedInterest: string;
  totalEarnedInterestRaw: bigint;
  lenderLoansCount: number;

  // Net position
  netPosition: string; // Formatted USDC
  netPositionRaw: bigint;
  isProfit: boolean;

  // Additional metrics
  activeOffersCount: number;
  xlmPrice: number;
}

/**
 * Hook to fetch aggregated dashboard statistics for the user
 * Combines data from multiple contract calls
 * @returns Query result with complete dashboard stats
 */
export function useDashboardStats() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["dashboard-stats", address],
    queryFn: async (): Promise<DashboardStats> => {
      if (!address) throw new Error("Wallet not connected");

      // Fetch all user data in parallel
      const [
        borrowerLoansResult,
        lenderLoansResult,
        userOffersResult,
        xlmPriceResult,
      ] = await Promise.all([
        lendingMarket.get_user_loans_as_borrower({ user: address }),
        lendingMarket.get_user_loans_as_lender({ user: address }),
        lendingMarket.get_user_offers({ user: address }),
        lendingMarket.get_xlm_price(),
      ]);

      const borrowerLoanIds = borrowerLoansResult.result || [];
      const lenderLoanIds = lenderLoansResult.result || [];
      const offerIds = userOffersResult.result || [];

      // Calculate borrowing stats
      let totalBorrowedRaw = 0n;
      let totalBorrowedInterestRaw = 0n;

      for (const loanId of borrowerLoanIds) {
        try {
          const loanResult = await lendingMarket.get_loan({ loan_id: loanId });
          if (!loanResult.result) continue;

          const loanData = loanResult.result.unwrap() as any;

          totalBorrowedRaw += loanData.borrowed_amount;
          totalBorrowedInterestRaw += loanData.accumulated_interest;

          // Calculate additional interest since last update
          // const currentTime = Math.floor(Date.now() / 1000);
          const interestResult = await lendingMarket.calculate_interest({
            loan_id: loanId,
            // current_time: BigInt(currentTime),
          });

          if (interestResult.result) {
            totalBorrowedInterestRaw += interestResult.result.unwrap();
          }
        } catch (error) {
          console.warn(`Failed to fetch loan ${loanId}:`, error);
        }
      }

      // Calculate lending stats
      let totalLentRaw = 0n;
      let totalEarnedInterestRaw = 0n;

      for (const loanId of lenderLoanIds) {
        try {
          const loanResult = await lendingMarket.get_loan({ loan_id: loanId });
          if (!loanResult.result) continue;

          const loanData = loanResult.result.unwrap() as any;

          totalLentRaw += loanData.borrowed_amount;
          totalEarnedInterestRaw += loanData.accumulated_interest;

          // Calculate additional interest since last update
          // const currentTime = Math.floor(Date.now() / 1000);
          const interestResult = await lendingMarket.calculate_interest({
            loan_id: loanId,
            // current_time: BigInt(currentTime),
          });

          if (interestResult.result) {
            totalEarnedInterestRaw += interestResult.result.unwrap();
          }
        } catch (error) {
          console.warn(`Failed to fetch loan ${loanId}:`, error);
        }
      }

      // Calculate net position (profit/loss)
      const netPositionRaw = totalEarnedInterestRaw - totalBorrowedInterestRaw;
      const isProfit = netPositionRaw >= 0n;

      // Get XLM price
      const priceData = xlmPriceResult.result as any;
      const xlmPrice = Number(priceData.price) / 1e14; // 14 decimals

      return {
        // Borrowing
        totalBorrowed: formatUsdc(totalBorrowedRaw),
        totalBorrowedRaw,
        totalBorrowedInterest: formatUsdc(totalBorrowedInterestRaw),
        totalBorrowedInterestRaw,
        borrowerLoansCount: borrowerLoanIds.length,

        // Lending
        totalLent: formatUsdc(totalLentRaw),
        totalLentRaw,
        totalEarnedInterest: formatUsdc(totalEarnedInterestRaw),
        totalEarnedInterestRaw,
        lenderLoansCount: lenderLoanIds.length,

        // Net
        netPosition: formatUsdc(netPositionRaw),
        netPositionRaw,
        isProfit,

        // Additional
        activeOffersCount: offerIds.length,
        xlmPrice,
      };
    },
    enabled: !!address,
    staleTime: 15000, // 15 seconds
    retry: 2,
  });
}
