import * as Client from "fungible_allowlist_example";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Standalone Network ; February 2017",
  contractId: "CBFDBJTY2WVKU4XM4ZNKXEA4N5QFVDZ33KVU7ZKRBHGXXDXBCOJB2LNB",
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
