import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { BPool__factory } from "elf-contracts/types/factories/BPool__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * returns a new instance of the market contract.
 * @param { string } marketAddress the contract address of the market.
 */
export const useMarketContract = (
  marketAddress: string,
  signerOrProvider?: Signer | Provider
) => {
  const marketContract = useMemo(
    () =>
      BPool__factory.connect(
        marketAddress,

        signerOrProvider ?? jsonRpcProvider
      ),
    [marketAddress, signerOrProvider]
  );

  return marketContract;
};
