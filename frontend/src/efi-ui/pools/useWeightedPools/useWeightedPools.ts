import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { WeightedPool__factory } from "elf-contracts/types/factories/WeightedPool__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";
import { YieldPoolTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { YieldPools } from "efi/pools/weightedPool";

interface YieldTokenPoolInfoWithContract extends YieldPoolTokenInfo {
  contract: WeightedPool;
}

export const yieldTokenPools: YieldTokenPoolInfoWithContract[] = YieldPools.map(
  (info) => {
    const contract = getSmartContractFromRegistry(
      info.address,
      WeightedPool__factory.connect
    ) as WeightedPool;
    return {
      ...info,
      contract,
    };
  }
);

/**
 * @deprecated, just use yieldTokenPools
 * @param signerOrProvider
 * @returns
 */
export function useWeightedPools(
  signerOrProvider?: Signer | Provider
): WeightedPool[] {
  return useMemo(() => {
    return yieldTokenPools.map((info) =>
      signerOrProvider ? info.contract.connect(signerOrProvider) : info.contract
    );
  }, [signerOrProvider]);
}
