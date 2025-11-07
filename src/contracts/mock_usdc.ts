import * as Client from "mock_usdc";

export default new Client.Client({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CDLMEZPLZ7R625QZMXZFGK4IU2GSF25MC44E4QWTABNXCONF3B3ZNIBN",
  rpcUrl: "https://soroban-testnet.stellar.org",
  allowHttp: false,
  publicKey: undefined,
});
