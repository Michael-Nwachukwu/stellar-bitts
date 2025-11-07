import * as Client from "nft_enumerable_example";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Standalone Network ; February 2017",
  contractId: "CC5X6ESAISIC5COO6U6E4PJX5ZWVDSP2IJUAUYD7FIQM4Y3TYS274SX6",
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
