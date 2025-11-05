import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { useContractClients } from "@/hooks/lending/useContractClients";
import { parseUsdc, percentageToBasisPoints } from "@/lib/lending-utils";

export interface CreateOfferParams {
  usdcAmount: string; // Human-readable amount like "10000.00"
  weeklyRate: number; // Percentage like 5.0 for 5%
  minCollateralRatio: number; // Percentage like 200 for 200%
  liquidationThreshold: number; // Percentage like 125 for 125%
  maxDurationWeeks: number;
}

/**
 * Hook to create a new lending offer
 * Handles USDC approval + contract call
 * @returns Mutation hook with loading state
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useWallet();
  const { mockUsdc, lendingMarket } = useContractClients();

  return useMutation({
    mutationFn: async (params: CreateOfferParams) => {
      if (!address) throw new Error("Wallet not connected");

      const usdcAmount = parseUsdc(params.usdcAmount);
      const weeklyRateBps = percentageToBasisPoints(params.weeklyRate);
      const minCollateralRatioBps = percentageToBasisPoints(
        params.minCollateralRatio,
      );
      const liquidationThresholdBps = percentageToBasisPoints(
        params.liquidationThreshold,
      );

      // Step 1: Approve USDC spending
      const approveTx = await mockUsdc.approve({
        from: address,
        spender: lendingMarket.options.contractId,
        amount: usdcAmount,
        expiration_ledger: 1000000, // Far future
      });

      // Sign and send the approval transaction
      await approveTx.signAndSend({
        signTransaction,
      });

      // Step 2: Create offer
      const offerTx = await lendingMarket.create_offer({
        lender: address,
        usdc_amount: usdcAmount,
        weekly_interest_rate: weeklyRateBps,
        min_collateral_ratio: minCollateralRatioBps,
        liquidation_threshold: liquidationThresholdBps,
        max_duration_weeks: params.maxDurationWeeks,
      });

      // Sign and send the create offer transaction
      const sentTx = await offerTx.signAndSend({
        signTransaction,
      });

      // Get the result from the transaction
      if (!sentTx.result) {
        throw new Error("Failed to create offer");
      }

      // The result is a Result<bigint, ErrorMessage> type from Stellar SDK
      return sentTx.result.unwrap(); // Returns offer_id
    },
    onSuccess: async () => {
      // Invalidate relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["active-offers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
      ]);
    },
  });
}
