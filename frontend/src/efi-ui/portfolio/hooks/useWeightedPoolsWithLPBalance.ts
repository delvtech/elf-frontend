import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber } from "ethers";

export function useWeightedPoolsWithLPBalance(
  account: string | null | undefined
): {
  pool: WeightedPool;
  lpBalance: BigNumber;
}[] {
  const allWeightedPools = useWeightedPools();
  const poolsWithLP = useTokensWithBalance(account, allWeightedPools);
  return poolsWithLP.map(({ balanceOf, token }) => ({
    pool: token,
    lpBalance: balanceOf,
  }));
}
