import { formatEther, formatUnits } from "ethers/lib/utils";

import { SwapEventWithTimeStamp } from "efi-balancer/SwapEvent";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useSwapFee } from "efi-ui/pools/useSwapFee/useSwapFee";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";
import { Money } from "ts-money";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { convertNumberToFiatBalance } from "efi/money/convertToFiatBalance";

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
): number | undefined {
  const swapEvents = useSwaps(pool, fromTime, toTime);
  const baseAssetContract = useBaseAssetForPool(pool);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);

  const swapFeeBN = useSwapFee(pool);

  if (!swapEvents?.length || !baseAssetContract || !baseAssetDecimals) {
    return undefined;
  }

  if (!swapFeeBN) {
    return 0;
  }

  const swapFee = +formatEther(swapFeeBN);

  if (isWeightedPool(pool) && swapFee) {
    return calculateWeightedPoolFees(
      swapEvents,
      baseAssetContract.address,
      baseAssetDecimals,
      swapFee
    );
  }

  if (isConvergentCurvePool(pool) && swapFee) {
    return calculateConvergentCurvePoolFees(
      swapEvents,
      baseAssetDecimals,
      swapFee
    );
  }

  return 0;
}

export function useFeeVolumeFiatForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): Money | undefined {
  const fees = useFeeVolumeForPool(pool, fromTime, toTime);
  const { currency } = useCurrencyPref();
  const baseAssetContract = useBaseAssetForPool(pool);
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

  if (!baseAssetPrice || !fees) {
    return undefined;
  }

  const fiatFees = convertNumberToFiatBalance(baseAssetPrice, fees);
  return fiatFees;
}

/**
 * Calculates the total fees collected for a WeightedPool in terms of the base asset.
 * @param swapEvents swap events to tally fees collected on
 * @param baseAssetAddress address of base asset
 * @param baseAssetDecimals decimals of base asset
 * @param swapFee swap fee decimal value: 0.01 is 1%
 * @returns fees collected in the base asset nominal value
 */
function calculateWeightedPoolFees(
  swapEvents: SwapEventWithTimeStamp[],
  baseAssetAddress: string,
  baseAssetDecimals: number,
  swapFee: number
): number {
  if (!swapFee) {
    return 0;
  }

  let fees = 0;
  swapEvents.forEach((event) => {
    const [, tokenIn, tokenOut, amountIn, amountOut] = event;
    if (tokenIn === baseAssetAddress) {
      const baseAssetTraded = +formatUnits(amountIn, baseAssetDecimals);
      const feeCollected = Math.abs(baseAssetTraded) * swapFee;
      fees += feeCollected;
    } else if (tokenOut === baseAssetAddress) {
      const baseAssetTraded = +formatUnits(amountOut, baseAssetDecimals);
      const feeCollected = Math.abs(baseAssetTraded) * swapFee;
      fees += feeCollected;
    }
  });

  return fees;
}

/**
 * Calculates the total fees collected for a ConvergentCurvePool in terms of the base asset.
 * @param swapEvents swap events to tally fees collected on
 * @param tokenDecimals decimals of the tokens
 * @param swapFee swap fee decimal value: 0.01 is 1%
 * @returns fees collected in the base asset nominal value
 */
function calculateConvergentCurvePoolFees(
  swapEvents: SwapEventWithTimeStamp[],
  tokenDecimals: number,
  swapFee: number
): number {
  if (!swapFee) {
    return 0;
  }

  let fees = 0;
  swapEvents.forEach((event) => {
    const [, , , amountIn, amountOut] = event;

    const amountOutNumber = +formatUnits(amountOut.abs(), tokenDecimals);
    const amountInNumber = +formatUnits(amountIn.abs(), tokenDecimals);
    const amountDifference = Math.abs(amountOutNumber - amountInNumber);
    const feeCollected = amountDifference * swapFee;
    fees += feeCollected;
  });

  return fees;
}
