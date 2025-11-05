import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "../useContractClients";
import { parseUsdc } from "@/lib/lending-utils";

export interface RepayParams {
  loanId: string; // Loan ID to repay
  repayAmount: string; // Human-readable USDC amount like "100.50"
}

/**
 * Hook to repay a loan (partial or full)
 * Handles USDC approval + contract call
 * @returns Mutation hook with loading state
 */
export function useRepay() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { lendingMarket, mockUsdc } = useContractClients();

  return useMutation({
    mutationFn: async (params: RepayParams) => {
      if (!address) throw new Error("Wallet not connected");

      const repayAmount = parseUsdc(params.repayAmount);
      const loanId = BigInt(params.loanId);

      // Step 1: Approve USDC spending for repayment
      const approveTx = await mockUsdc.approve({
        from: address,
        spender: lendingMarket.options.contractId,
        amount: repayAmount,
        expiration_ledger: 1000000,
      });

      await approveTx.signAndSend({ signTransaction });

      // Step 2: Repay loan
      const repayTx = await lendingMarket.repay({
        borrower: address,
        loan_id: loanId,
        repay_amount: repayAmount,
      });

      const sentTx = await repayTx.signAndSend({ signTransaction });

      if (!sentTx.result) {
        throw new Error("Failed to repay loan");
      }

      return sentTx.result.unwrap();
    },
    onSuccess: async (_, variables) => {
      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["loan", variables.loanId] }),
        queryClient.invalidateQueries({
          queryKey: ["loan-health", variables.loanId],
        }),
        queryClient.invalidateQueries({ queryKey: ["user-loans-borrower"] }),
        queryClient.invalidateQueries({ queryKey: ["user-loans-lender"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
