import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { BPool__factory } from "elf-contracts/types/factories/BPool__factory";
import { Signer } from "ethers";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * returns a new instance of the market contract.
 * @param { string } marketAddress the contract address of the market.
 * @param { Signer | Provider } signerOrProvider optionally pass a signer if transactions need to be
 * signed.  a default provider is supplied to allow read operations.
 */
export const useMarketContract = (
  marketAddress: string | undefined,
  signerOrProvider?: Signer | Provider
) => {
  const signer = signerOrProvider ?? jsonRpcProvider;

  const marketContract = useMemo(() => {
    if (!marketAddress) {
      return undefined;
    }
    return BPool__factory.connect(marketAddress, signer);
  }, [marketAddress, signer]);

  return marketContract;
};
