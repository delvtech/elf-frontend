import { Provider } from "@ethersproject/providers";
import { providers } from "ethers";

import { AddressesJson } from "efi/addresses";
import { ChainId } from "efi/ethereum";

const LOCAL_RPC_HOST = "http://127.0.0.1:8545";
const ALCHEMY_GOERLI_KEY = process.env.REACT_APP_GOERLI_ALCHEMY_KEY as string;
export const localhostProvider = new providers.JsonRpcProvider(LOCAL_RPC_HOST);

// eslint-disable-next-line no-var
export var defaultProvider = getProvider();

// Default rpc host to local, but check the chain id in the addresses.json for
// final say
function getProvider() {
  // TODO: improve on this to dynamically grab the correct chainid/key.  hardcoded to goerli for now.
  const alchemyWebSocketProvider = new providers.AlchemyWebSocketProvider(
    ChainId.GOERLI,
    ALCHEMY_GOERLI_KEY
  );
  // always use localhostProvider for tests
  if (process.env.NODE_ENV === "test") {
    return localhostProvider;
  }

  // otherwise, if a chain id is provided, we'll use the corresponding alchemy provider.  right now
  // this is only goerli.
  if (AddressesJson.chainId === ChainId.GOERLI) {
    return alchemyWebSocketProvider as Provider;
  }

  // default to localhost
  return localhostProvider;
}

window.addEventListener(
  "focus",
  function () {
    defaultProvider = getProvider();
  },
  false
);
