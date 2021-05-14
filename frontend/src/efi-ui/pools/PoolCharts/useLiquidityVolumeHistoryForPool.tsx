import { formatUnits } from "ethers/lib/utils";

import { TimeData } from "efi-ui/charts/BrushChart/BrushChart";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";
import { EMPTY_ARRAY } from "efi/base/emptyArray";

/**
 * Returns the fiat volume for a pool in a given time range
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds previous to now to start the query
 * @param toTime time in seconds previous to now to end the query.  if no value given, ends at
 * latest block.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */
export function useVolumeHistoryForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): TimeData[] | undefined {
  const swapEvents = useSwaps(pool, fromTime, toTime);
  const baseAsset = useBaseAssetForPool(pool);
  const { currency } = useCurrencyPref();
  const { data: baseAssetDecimals } = useTokenDecimals(baseAsset);
  const [baseAssetFiatPrice] = useTokenPrice(baseAsset, currency);

  if (swapEvents?.length && baseAsset && baseAssetFiatPrice) {
    return swapEvents.map((swapEvent, index) => {
      const [, tokenIn, , amountIn, amountOut, timeMs] = swapEvent;
      // only count base asset so we don't double count volume.
      const amount = baseAsset.address === tokenIn ? amountIn : amountOut;
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
