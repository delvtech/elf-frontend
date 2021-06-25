import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { ONE_DAY_IN_SECONDS, ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { PoolInfo } from "efi/pools/PoolInfo";

export function useStakingAPY(poolInfo: PoolInfo): number {
  const totalLiquidity = useTotalFiatLiquidity(poolInfo);
  const feeVolume24hr = useFeeVolumeFiatForPool(poolInfo);

  const liquidity = totalLiquidity?.toDecimal();
  const fees = feeVolume24hr.toDecimal();
  let stakingAPY = 0;
  if (liquidity && fees) {
    const stakingYield24hr = fees / liquidity;
    stakingAPY = (stakingYield24hr * ONE_YEAR_IN_SECONDS) / ONE_DAY_IN_SECONDS;
  }
  return stakingAPY;
}
