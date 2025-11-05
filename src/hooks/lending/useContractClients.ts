import { useMemo } from "react";
import * as MockUsdcClient from "mock_usdc";
import * as LendingMarketClient from "lending_market";
import { useWallet } from "@/hooks/useWallet";

/**
 * Hook to get contract clients configured with the current wallet
 * This ensures transactions are signed with the correct account
 */
export function useContractClients() {
  const { address } = useWallet();

  const mockUsdc = useMemo(() => {
    return new MockUsdcClient.Client({
      networkPassphrase: "Test SDF Network ; September 2015",
      contractId: "CDLMEZPLZ7R625QZMXZFGK4IU2GSF25MC44E4QWTABNXCONF3B3ZNIBN",
      rpcUrl: "https://soroban-testnet.stellar.org",
      allowHttp: false,
      publicKey: address,
    });
  }, [address]);

  const lendingMarket = useMemo(() => {
    return new LendingMarketClient.Client({
      networkPassphrase: "Test SDF Network ; September 2015",
      contractId: "CALZAKWIDYX4COYTCRYU3PQXO4RV6ZSJRWBQLCF5CENRD2QSWQD52XX6",
      rpcUrl: "https://soroban-testnet.stellar.org",
      allowHttp: false,
      publicKey: address,
    });
  }, [address]);

  return { mockUsdc, lendingMarket };
}
