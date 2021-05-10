import { WeightedPool } from "elf-contracts/types/WeightedPool";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";

export function useWeightedPoolsWithLPBalance(
  account: string | null | undefined
): WeightedPool[] {
  const allWeightedPools = useWeightedPools();
  const poolsWithLP = useTokensWithBalance(account, allWeightedPools);
  return poolsWithLP
    .filter(
      ({ balanceOf }) => !isDust(balanceOf, BALANCER_POOL_LP_TOKEN_DECIMALS)
    )
    .map(({ token }) => token);
}
