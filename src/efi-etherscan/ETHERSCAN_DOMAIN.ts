import { AddressesJson } from "efi/addresses/addresses";
import { ChainId } from "efi/ethereum/ethereum";

export const ETHERSCAN_DOMAIN =
  AddressesJson.chainId === ChainId.GOERLI
    ? "https://goerli.etherscan.io"
    : "https://etherscan.io";
