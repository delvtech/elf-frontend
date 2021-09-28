import { CRVLUSD__factory } from "elf-contracts-typechain/dist/types/factories/CRVLUSD__factory";

import { AddressesJson } from "efi/addresses";
import { defaultProvider } from "efi/providers/providers";

/**
 * Curve stable pools provide a `get_virtual_price` method for getting the price.
 */
const {
  addresses: {
    "alusd3crv-fAddress": crvalusdAddress,
    "lusd3crv-fAddress": crvlusdAddress,
  },
} = AddressesJson;

const crvalusdContract = CRVLUSD__factory.connect(
  // Note: the CRVLUSD_factory is the same, so it can handle both alusd and lusd pools.
  crvalusdAddress || "0x0000000000000000000000000000000000000000",
  defaultProvider
);

const crvlusdContract = CRVLUSD__factory.connect(
  crvlusdAddress,
  defaultProvider
);

export const curveVirtualPriceContractsByAddress = {
  [crvalusdAddress]: crvalusdContract,
  [crvlusdAddress]: crvlusdContract,
};

export function isCurveStablePool(address: string): boolean {
  return [crvalusdAddress, crvlusdAddress].includes(address);
}
