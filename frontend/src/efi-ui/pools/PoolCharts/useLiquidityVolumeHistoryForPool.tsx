import { formatUnits } from "ethers/lib/utils";

import { TimeData } from "efi-ui/pools/PoolCharts/PoolCharts";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { EMPTY_ARRAY } from "efi/base/emptyArray";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

/**
 * Returns the fiat volume for a pool in a given time range
 * @param poolIno contract of the pool to query.
 * @param fromTime time in seconds previous to now to start the query
 * @param toTime time in seconds previous to now to end the query.  if no value given, ends at
 * latest block.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */
export function useVolumeHistoryForPool(
  poolInfo: PoolInfo,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): TimeData[] | undefined {
  const {
    baseAssetContract,
    baseAssetInfo: { decimals: baseAssetDecimals, address: baseAssetAddress },
  } = getPoolTokens(poolInfo);
  const swapEvents = useSwaps(poolInfo, fromTime, toTime);
  const { currency } = useCurrencyPref();
  const [baseAssetFiatPrice] = useTokenPrice(baseAssetContract, currency);

  if (swapEvents?.length && baseAssetContract && baseAssetFiatPrice) {
    return swapEvents.map((swapEvent, index) => {
      const [, tokenIn, , amountIn, amountOut, timeMs] = swapEvent;
      // only count base asset so we don't double count volume.
      const amount = baseAssetAddress === tokenIn ? amountIn : amountOut;
      const value =
        Math.abs(+formatUnits(amount, baseAssetDecimals)) *
        baseAssetFiatPrice.toDecimal();
      return {
        value,
        timeMs,
      };
    });
  }

  return EMPTY_ARRAY as TimeData[];
}
