import { WeightedPool } from "elf-contracts/types/WeightedPool";

import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { hasLPDust } from "efi-ui/pools/hasLPDust";

export function useWeightedPoolsWithLPBalance(
  account: string | null | undefined
): WeightedPool[] {
  const allWeightedPools = useWeightedPools();
  const poolsWithLP = useTokensWithBalance(account, allWeightedPools);
  return poolsWithLP
    .filter(({ balanceOf }) => !hasLPDust(balanceOf))
    .map(({ token }) => token);
}
