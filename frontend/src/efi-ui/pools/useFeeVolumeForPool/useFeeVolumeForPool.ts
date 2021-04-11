import { formatEther } from "ethers/lib/utils";
import { Money } from "ts-money";

import { useSwapFee } from "efi-ui/pools/useSwapFee/useSwapFee";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";

/**
 * Returns the fiat volume for a pool in a given time range
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds previous to now to start the query
 * @param toTime time in seconds previous to now to end the query.  if no value given, ends at
 * latest block.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */
export function useFeeVolumeForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): Money | undefined {
  const { currency } = useCurrencyPref();
  const volume = useVolumeForPool(pool, fromTime, toTime);
  const swapFee = useSwapFee(pool);

  if (isWeightedPool(pool) && volume && swapFee) {
    const fees = volume?.toDecimal() * +formatEther(swapFee);
    return Money.fromDecimal(fees, currency, Math.round);
  }

  if (isConvergentCurvePool(pool) && volume && swapFee) {
    return new Money(0, currency);
  }
}
