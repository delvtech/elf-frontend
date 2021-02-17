import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";

import { getERC20Contract } from "efi/contracts/getERC20Contract";

export function useERC20Contracts(
  addresses: (string | undefined)[],
  signerOrProvider?: Signer | Provider
): (ERC20 | undefined)[] {
  const contracts = useMemo(
    () =>
      addresses.map((address) => {
        if (!address) {
          return undefined;
        }
        return getERC20Contract(address, signerOrProvider);
      }),
    [addresses, signerOrProvider]
  );

  return contracts;
}
