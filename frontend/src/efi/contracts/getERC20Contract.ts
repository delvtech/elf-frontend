import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

import { defaultProvider } from "efi/providers/providers";

const erc20Cache: Record<string, ERC20> = {};
export function getERC20Contract(
  address: string | undefined,
  signerOrProvider?: Signer | Provider
): ERC20 | undefined {
  if (!address) {
    return;
  }

  const signer = signerOrProvider ?? defaultProvider;
  if (!erc20Cache[address]) {
    erc20Cache[address] = ERC20__factory.connect(address, signer);
  }

  return erc20Cache[address];
}
