import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import {
  useUserLoansAsBorrowerWithData,
  useUserOffersWithData,
} from "@/hooks/lending";
import type { Notification } from "@/types/dashboard";

/**
 * Hook to generate notifications based on user's lending activity
 * Uses current state of loans and offers to create relevant notifications
 * @returns Array of notifications sorted by priority and timestamp
 */
export function useNotifications() {
  const { address } = useWallet();
  const { data: borrowerLoans = [] } = useUserLoansAsBorrowerWithData();
  const { data: offers = [] } = useUserOffersWithData();

  return useQuery({
    queryKey: ["notifications", address, borrowerLoans.length, offers.length],
    queryFn: (): Notification[] => {
      if (!address) return [];
      const notifications: Notification[] = [];
      const now = new Date();

      // Process borrower loans
      borrowerLoans.forEach((loan) => {
        const loanId = loan.loan_id?.toString() || "unknown";
        const borrowedAmount = Number(loan.borrowed_amount || BigInt(0)) / 1e7;
        const interest = Number(loan.accumulated_interest || BigInt(0)) / 1e7;
        const collateralAmount =
          Number(loan.collateral_amount || BigInt(0)) / 1e7;

        // Loan created notification (if recent)
        const loanAge = now.getTime() - Number(loan.start_time || 0) * 1000;
        if (loanAge < 24 * 60 * 60 * 1000) {
          // Less than 24 hours old
          notifications.push({
            id: `loan-created-${loanId}`,
            title: "🎉 Loan Created",
            message: `Successfully borrowed $${borrowedAmount.toFixed(2)} USDC with ${collateralAmount.toFixed(0)} XLM collateral`,
            type: "success",
            read: false,
            timestamp: new Date(
              Number(loan.start_time || 0) * 1000,
            ).toISOString(),
            priority: "medium",
          });
        }

        // Interest accumulation warning
        if (interest > 5) {
          notifications.push({
            id: `interest-${loanId}`,
            title: "💰 Interest Accruing",
            message: `Loan #${loanId} has $${interest.toFixed(2)} in accumulated interest`,
            type: "info",
            read: false,
            timestamp: now.toISOString(),
            priority: "low",
          });
        }

        // High interest warning
        if (interest > borrowedAmount * 0.1) {
          // More than 10% of principal
          notifications.push({
            id: `interest-high-${loanId}`,
            title: "⚠️ High Interest",
            message: `Interest on loan #${loanId} has reached $${interest.toFixed(2)} (${((interest / borrowedAmount) * 100).toFixed(1)}% of principal)`,
            type: "warning",
            read: false,
            timestamp: now.toISOString(),
            priority: "medium",
          });
        }
      });

      // Process offers
      offers.forEach((offer) => {
        const offerId = offer.offer_id?.toString() || "unknown";
        const amount = Number(offer.usdc_amount || BigInt(0)) / 1e7;
        const weeklyRate = (offer.weekly_interest_rate || 0) / 100;

        // Offer created notification (if recent)
        const offerAge = now.getTime() - Number(offer.created_at || 0) * 1000;
        if (offerAge < 24 * 60 * 60 * 1000) {
          // Less than 24 hours old
          notifications.push({
            id: `offer-created-${offerId}`,
            title: "✅ Offer Created",
            message: `Your lending offer of $${amount.toFixed(0)} USDC at ${weeklyRate}% weekly is now active`,
            type: "success",
            read: false,
            timestamp: new Date(
              Number(offer.created_at || 0) * 1000,
            ).toISOString(),
            priority: "medium",
          });
        }

        // Active offer reminder
        if (amount > 0) {
          const apy = weeklyRate * 52;
          notifications.push({
            id: `offer-active-${offerId}`,
            title: "📊 Active Lending Offer",
            message: `Offer #${offerId}: $${amount.toFixed(0)} available at ${apy.toFixed(1)}% APY`,
            type: "info",
            read: false,
            timestamp: now.toISOString(),
            priority: "low",
          });
        }
      });

      // Add welcome notification if no activity
      if (borrowerLoans.length === 0 && offers.length === 0) {
        notifications.push({
          id: "welcome",
          title: "👋 Welcome to Stellar Bits",
          message:
            "Start by creating a lending offer or borrowing from the marketplace",
          type: "info",
          read: false,
          timestamp: now.toISOString(),
          priority: "low",
        });
      }

      // Sort by priority and timestamp
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return notifications.sort((a, b) => {
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    },
    enabled: !!address,
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
