import { AddressesJson } from "efi/addresses";
import { ChainId } from "efi/crypto/ethereum";
import { providers } from "ethers";

// Default rpc host to local, but check the chain id in the addresses.json for
// final say
let RPC_HOST = "http://127.0.0.1:8545";
if (AddressesJson.chainId === ChainId.GOERLI) {
  RPC_HOST = process.env.REACT_APP_RPC_HOST_GOERLI as string;
}

export const jsonRpcProvider = new providers.JsonRpcProvider(RPC_HOST);
