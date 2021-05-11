import { Provider } from "@ethersproject/providers";
import { WeightedPool__factory } from "elf-contracts/types/factories/WeightedPool__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";

import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { yieldTokenPoolInfos } from "efi/tokenlists";
import { YieldTokenPoolInfo } from "tokenlists/types";

export interface YieldTokenPoolInfoWithContract extends YieldTokenPoolInfo {
  contract: WeightedPool;
}

export const yieldTokenPools: YieldTokenPoolInfoWithContract[] =
  yieldTokenPoolInfos.map((info) => {
    const contract = getSmartContractFromRegistry(
      info.address,
      WeightedPool__factory.connect
    ) as WeightedPool;
    return {
      ...info,
      contract,
    };
  });

/**
 * @deprecated, just use yieldTokenPools
 * @param signerOrProvider
 * @returns
 */
export function useWeightedPools(
  signerOrProvider?: Signer | Provider
): WeightedPool[] {
  return yieldTokenPools.map((info) =>
    signerOrProvider ? info.contract.connect(signerOrProvider) : info.contract
  );
}
