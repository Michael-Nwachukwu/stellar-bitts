import * as Client from "lending_market";

export default new Client.Client({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CALZAKWIDYX4COYTCRYU3PQXO4RV6ZSJRWBQLCF5CENRD2QSWQD52XX6",
  rpcUrl: "https://soroban-testnet.stellar.org",
  allowHttp: false,
  publicKey: undefined,
});
