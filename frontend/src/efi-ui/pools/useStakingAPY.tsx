import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { ONE_DAY_IN_SECONDS, ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

export function useStakingAPY(pool: PoolContract | undefined): number {
  const totalLiquidity = useTotalFiatLiquidityForPool(pool);
  const feeVolume24hr = useFeeVolumeFiatForPool(pool);

  const liquidity = totalLiquidity?.toDecimal();
  const fees = feeVolume24hr.toDecimal();
  let stakingAPY = 0;
  if (liquidity && fees) {
    const stakingYield24hr = fees / liquidity;
    stakingAPY = (stakingYield24hr * ONE_YEAR_IN_SECONDS) / ONE_DAY_IN_SECONDS;
  }
  return stakingAPY;
}
