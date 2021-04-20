import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";
import { PoolContract } from "efi/pools/PoolContract";

export function useAllPools(
  signerOrProvider?: Signer | Provider
): (PoolContract | undefined)[] {
  const convergentPoolContracts = useConvergentCurvePools(signerOrProvider);
  const weightedPoolContracts = useWeightedPools(signerOrProvider);
  return [...convergentPoolContracts, ...weightedPoolContracts];
}
