import { useMutation, useQueryClient } from "@tanstack/react-query";
import lendingMarket from "@/contracts/lending_market";
import mockUsdc from "@/contracts/mock_usdc";
import { useWallet } from "@/hooks/useWallet";

export interface LiquidateParams {
  loanId: string; // Loan ID to liquidate
  totalDebt: string; // Human-readable USDC debt amount (for approval)
}

/**
 * Hook to liquidate an unhealthy loan
 * Liquidator pays off the debt and receives collateral + 5% bonus
 * Requires USDC approval for the debt amount
 * @returns Mutation hook with loading state
 */
export function useLiquidate() {
  const queryClient = useQueryClient();
  const { address } = useWallet();

  return useMutation({
    mutationFn: async (params: LiquidateParams) => {
      if (!address) throw new Error("Wallet not connected");

      const loanId = BigInt(params.loanId);

      // Parse the total debt for USDC approval
      // We need to approve the full debt amount
      const debtAmount = BigInt(params.totalDebt);

      // Step 1: Approve USDC spending for liquidation
      const approveResult = await mockUsdc.approve({
        from: address,
        spender: lendingMarket.options.contractId,
        amount: debtAmount,
        expiration_ledger: 1000000, // Far future
      });

      if (!approveResult.result) {
        throw new Error("USDC approval failed");
      }

      // Step 2: Execute liquidation
      const { result } = await lendingMarket.liquidate({
        liquidator: address,
        loan_id: loanId,
      });

      return result;
    },
    onSuccess: async (_, variables) => {
      // Invalidate many queries since liquidation affects multiple entities
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loan", variables.loanId] }),
        queryClient.invalidateQueries({
          queryKey: ["loan-health", variables.loanId],
        }),
        queryClient.invalidateQueries({ queryKey: ["user-loans-borrower"] }),
        queryClient.invalidateQueries({ queryKey: ["user-loans-lender"] }),
        queryClient.invalidateQueries({ queryKey: ["active-loans"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
