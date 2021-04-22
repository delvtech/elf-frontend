import zip from "lodash.zip";
import { Money } from "ts-money";

import { useTotalLiquidityForPoolMulti } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useShareOfPoolMulti } from "efi-ui/pools/useShareOfPool";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * Returns how much money an account has provided to the list of pools as
 * liquidity.
 */
export function useTotalLiquidityProvidedMulti(
  pools: (PoolContract | undefined)[],
  account: string | null | undefined
): (Money | undefined)[] {
  const shareOfPoolMulti = useShareOfPoolMulti(pools, account);

  const totalLiquidityInConvergentCurvePools = useTotalLiquidityForPoolMulti(
    pools
  );

  const shareOfPoolFiatMulti = zip(
    shareOfPoolMulti,
    totalLiquidityInConvergentCurvePools
  ).map(([shareOfPool, totalLiquidity]) => {
    if (!totalLiquidity || !shareOfPool) {
      return undefined;
    }
    return totalLiquidity.multiply(shareOfPool);
  });

  return shareOfPoolFiatMulti;
}
