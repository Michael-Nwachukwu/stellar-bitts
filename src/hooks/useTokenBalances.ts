import { useQuery } from "@tanstack/react-query";
import { useWallet } from "./useWallet";
import mockUsdc from "@/contracts/mock_usdc";
import { fetchBalance } from "@/util/wallet";

/**
 * Hook to fetch XLM and USDC token balances for the connected wallet
 * @returns Object with XLM and USDC balances
 */
export function useTokenBalances() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ["token-balances", address],
    queryFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      try {
        // Fetch XLM balance from Horizon using the same method as useWalletBalance
        const balances = await fetchBalance(address);

        // XLM balance (native asset)
        const xlmBalance = balances.find((b) => b.asset_type === "native");
        const xlmAmount =
          xlmBalance && "balance" in xlmBalance
            ? parseFloat(xlmBalance.balance)
            : 0;

        // USDC balance using mock USDC contract
        let usdcAmount = 0;
        try {
          const { result } = await mockUsdc.balance({
            id: address,
          });

          if (result) {
            const balance = result.unwrap();
            usdcAmount = Number(balance) / 1e7; // 7 decimals
          }
        } catch (error) {
          console.warn("Could not fetch USDC balance:", error);
        }

        return {
          xlm: xlmAmount,
          usdc: usdcAmount,
        };
      } catch (error) {
        console.error("Error fetching token balances:", error);
        return {
          xlm: 0,
          usdc: 0,
        };
      }
    },
    enabled: !!address,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2,
  });
}
