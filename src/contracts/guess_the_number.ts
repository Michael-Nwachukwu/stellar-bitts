import * as Client from "guess_the_number";
import { rpcUrl } from "./util";

export default new Client.Client({
  networkPassphrase: "Standalone Network ; February 2017",
  contractId: "CBZTTNTA5LMBSL6PI5D5BJ4JTP6OUFPTHQ4C6DDF75SGE7RTQTSI2X4W",
  rpcUrl,
  allowHttp: true,
  publicKey: undefined,
});
