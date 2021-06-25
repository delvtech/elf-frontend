import { ExternalProvider, Provider } from "@ethersproject/providers";
import { providers } from "ethers";
import { createAlchemyWeb3 } from "@alch/alchemy-web3";

import { AddressesJson } from "efi/addresses";
import { ChainId } from "efi/ethereum";

const LOCAL_RPC_HOST = "http://127.0.0.1:8545";
const ALCHEMY_GOERLI_KEY = process.env.REACT_APP_GOERLI_ALCHEMY_KEY as string;
export const ALCHEMY_GOERLI_HTTP_URL = `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`;
export const localhostProvider = new providers.JsonRpcProvider(LOCAL_RPC_HOST);

const web3 = createAlchemyWeb3(
  `wss://eth-goerli.ws.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`
);
// TODO: improve on this to dynamically grab the correct chainid/key.  hardcoded to goerli for now.
const alchWeb3WebSocketProvider = new providers.Web3Provider(
  web3.currentProvider as ExternalProvider,
  AddressesJson.chainId
);

// eslint-disable-next-line no-var
export var defaultProvider = getProvider();

// Default rpc host to local, but check the chain id in the addresses.json for
// final say
function getProvider() {
  // always use localhostProvider for tests
  if (process.env.NODE_ENV === "test") {
    return localhostProvider;
  }

  // otherwise, if a chain id is provided, we'll use the corresponding alchemy provider.  right now
  // this is only goerli.
  if (AddressesJson.chainId === ChainId.GOERLI) {
    return alchWeb3WebSocketProvider as Provider;
  }

  // default to localhost
  return localhostProvider;
}
