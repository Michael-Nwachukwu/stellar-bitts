import * as Client from "mock_oracle";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Standalone Network ; February 2017",
  contractId: "CBR62MIRODL66RVS4OPURXAVARF6H2EW5VFQSOB6W3G23WUWK7ZQRNGM",
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
