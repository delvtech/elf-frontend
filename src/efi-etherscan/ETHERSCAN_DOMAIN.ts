import { AddressesJson } from "efi/addresses";
import { ChainId } from "efi/ethereum";

export const ETHERSCAN_DOMAIN =
  AddressesJson.chainId === ChainId.GOERLI
    ? "https://goerli.etherscan.io"
    : "https://etherscan.io";
