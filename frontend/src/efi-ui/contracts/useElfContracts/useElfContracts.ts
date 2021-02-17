import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Elf } from "elf-contracts/types/Elf";
import { Signer } from "ethers";

import { getElfContract } from "efi/contracts/getElfContract";

export function useElfContracts(
  elfAddresses: (string | undefined)[],
  signerOrProvider?: Signer | Provider
): (Elf | undefined)[] {
  const contracts = useMemo(
    () =>
      elfAddresses.map((address) => {
        if (!address) {
          return undefined;
        }
        return getElfContract(address, signerOrProvider);
      }),
    [elfAddresses, signerOrProvider]
  );

  return contracts;
}
