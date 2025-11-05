import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "../useContractClients";
import { parseXlm } from "@/lib/lending-utils";

export interface AddCollateralParams {
  loanId: string; // Loan ID to add collateral to
  additionalCollateral: string; // Human-readable XLM amount like "500.00"
}

/**
 * Hook to add more XLM collateral to an existing loan
 * Improves health factor and reduces liquidation risk
 * Note: XLM collateral approval is handled by the SDK/wallet during transaction signing
 * @returns Mutation hook with loading state
 */
export function useAddCollateral() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { lendingMarket } = useContractClients();

  return useMutation({
    mutationFn: async (params: AddCollateralParams) => {
      if (!address) throw new Error("Wallet not connected");

      const additionalCollateral = parseXlm(params.additionalCollateral);
      const loanId = BigInt(params.loanId);

      // Note: XLM collateral approval is handled by SDK/wallet during signing
      // No explicit approval transaction needed for XLM

      // Add collateral to loan
      const collateralTx = await lendingMarket.add_collateral({
        borrower: address,
        loan_id: loanId,
        additional_collateral: additionalCollateral,
      });

      const sentTx = await collateralTx.signAndSend({ signTransaction });

      if (!sentTx.result) {
        throw new Error("Failed to add collateral");
      }

      return sentTx.result.unwrap();
    },
    onSuccess: async (_, variables) => {
      // Invalidate relevant queries - health will improve
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
