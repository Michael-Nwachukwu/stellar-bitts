import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "../useContractClients";
import { parseXlm } from "@/lib/lending-utils";

export interface WithdrawCollateralParams {
  loanId: string; // Loan ID to withdraw collateral from
  amount: string; // Human-readable XLM amount like "100.00"
}

/**
 * Hook to withdraw excess XLM collateral from a loan
 * Must maintain minimum collateralization ratio
 * No token approval needed (withdrawing, not depositing)
 * @returns Mutation hook with loading state
 */
export function useWithdrawCollateral() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { lendingMarket } = useContractClients();

  return useMutation({
    mutationFn: async (params: WithdrawCollateralParams) => {
      if (!address) throw new Error("Wallet not connected");

      const withdrawAmount = parseXlm(params.amount);
      const loanId = BigInt(params.loanId);

      // Withdraw collateral (no approval needed - we're receiving tokens)
      const withdrawTx = await lendingMarket.withdraw_collateral({
        borrower: address,
        loan_id: loanId,
        amount: withdrawAmount,
      });

      const sentTx = await withdrawTx.signAndSend({ signTransaction });

      if (!sentTx.result) {
        throw new Error("Failed to withdraw collateral");
      }

      return sentTx.result.unwrap();
    },
    onSuccess: async (_, variables) => {
      // Invalidate relevant queries - health may decrease
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loan", variables.loanId] }),
        queryClient.invalidateQueries({
          queryKey: ["loan-health", variables.loanId],
        }),
        queryClient.invalidateQueries({ queryKey: ["user-loans-borrower"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
