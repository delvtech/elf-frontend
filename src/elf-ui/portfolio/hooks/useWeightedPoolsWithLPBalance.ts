import { WeightedPool } from "elf-contracts-typechain/dist/types/WeightedPool";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "elf-balancer/pools";
import { useTokensWithBalance } from "elf-ui/token/hooks/useTokensWithBalance";
import { isDust } from "elf/coins/isDust";
import { yieldPoolContracts } from "elf/pools/weightedPool";

export function useWeightedPoolsWithLPBalance(
  account: string | null | undefined
): WeightedPool[] {
  const allWeightedPools = yieldPoolContracts;
  const poolsWithLP = useTokensWithBalance(account, allWeightedPools);
  return poolsWithLP
    .filter(
      ({ balanceOf }) => !isDust(balanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS)
    )
    .map(({ token }) => token);
}
