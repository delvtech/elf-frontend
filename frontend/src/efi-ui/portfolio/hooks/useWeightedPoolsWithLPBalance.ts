import { WeightedPool } from "elf-contracts/types/WeightedPool";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";
import { yieldPoolContracts } from "efi/pools/weightedPool";

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
