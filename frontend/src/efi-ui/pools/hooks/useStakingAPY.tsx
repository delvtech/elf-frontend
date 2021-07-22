import { useFeeVolumeFiatForPool } from "efi-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { ONE_WEEK_IN_SECONDS, ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { PoolInfo } from "efi/pools/PoolInfo";

export function useStakingAPY(
  poolInfo: PoolInfo,
  fromTime: number = ONE_WEEK_IN_SECONDS,
  toTime?: number
): number {
  const totalLiquidity = useTotalFiatLiquidity(poolInfo);
  const feeVolumeOverTimePeriod = useFeeVolumeFiatForPool(
    poolInfo,
    fromTime,
    toTime
  );

  const nowInSeconds = Date.now() / 1000;
  const { createdAtTimestamp } = poolInfo.extensions;

  const poolAge = Math.floor(nowInSeconds - createdAtTimestamp);
  // if the pool isn't as old as the fromTime, then we use the pool age so we don't count time that
  // hasn't happened yet.
  const adjustedfromTime = Math.min(poolAge, fromTime);

  // if a toTime is specified, then use the to - from time range.  otherwise use the adjusted from time.
  const timePeriod = !!toTime ? toTime - fromTime : adjustedfromTime;

  const liquidity = totalLiquidity?.toDecimal();
  const fees = feeVolumeOverTimePeriod.toDecimal();
  let stakingAPY = 0;
  if (liquidity && fees) {
    const stakingYieldOverPeriod = fees / liquidity;
    stakingAPY = (stakingYieldOverPeriod * ONE_YEAR_IN_SECONDS) / timePeriod;
  }
  return stakingAPY;
}
