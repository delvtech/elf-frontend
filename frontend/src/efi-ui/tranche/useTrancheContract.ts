import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useTrancheContract(
  address: string | undefined,
  signerOrProvider?: Signer | Provider
) {
  const trancheContract = useMemo(() => {
    if (!address) {
      return undefined;
    }

    const contract = Tranche__factory.connect(
      address,
      signerOrProvider ?? jsonRpcProvider
    );
    return contract;
  }, [address, signerOrProvider]);

  return trancheContract;
}
