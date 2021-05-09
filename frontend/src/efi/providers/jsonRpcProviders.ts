import { AlchemyWebSocketProvider } from "@ethersproject/providers";

import { AddressesJson } from "efi/addresses";
import { ChainId } from "efi/ethereum";
import { providers } from "ethers";

// Default rpc host to local, but check the chain id in the addresses.json for
// final say
const LOCAL_RPC_HOST = "http://127.0.0.1:8545";
export const localhostProvider = new providers.JsonRpcProvider(LOCAL_RPC_HOST);
export const alchemyProvider = new AlchemyWebSocketProvider(
  AddressesJson.chainId,
  process.env.REACT_APP_GOERLI_ALCHEMY_KEY
);

export const jsonRpcProvider =
  AddressesJson.chainId === ChainId.GOERLI
    ? alchemyProvider
    : localhostProvider;
