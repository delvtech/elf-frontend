import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * returns a new instance of the market contract.
 * @param { string } marketAddress the contract address of the market.
 */
export const useTrancheContract = (
  address: string,
  signerOrProvider?: Signer | Provider
) => {
  const trancheContract = useMemo(() => {
    const contract = Tranche__factory.connect(
      address,
      signerOrProvider ?? jsonRpcProvider
    );
    return contract;
  }, [address, signerOrProvider]);

  return trancheContract;
};
