import { AddressesJson } from "elf/addresses";
import { ChainId } from "elf/ethereum";

export const ETHERSCAN_DOMAIN =
  AddressesJson.chainId === ChainId.GOERLI
    ? "https://goerli.etherscan.io"
    : "https://etherscan.io";
