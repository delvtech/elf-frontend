import { useQuery } from "react-query";

import { Event } from "@ethersproject/contracts";
import { BigNumber } from "ethers";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSwapFee } from "efi-ui/pools/useSwapFee/useSwapFee";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
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
  const convergentCurvePoolVolume = useFeeVolumeForConvergentCurvePool(
    pool,
    fromTime,
    toTime
  );
  const swapFee = useSwapFee(pool);

  if (isWeightedPool(pool) && volume && swapFee) {
    const fees = volume?.toDecimal() * +formatEther(swapFee);
    return Money.fromDecimal(fees, currency, Math.round);
  }

  if (isConvergentCurvePool(pool) && volume && swapFee) {
    return convergentCurvePoolVolume;
  }
}

function useFeeVolumeForConvergentCurvePool(
  pool: PoolContract | undefined,
  fromTime: number,
  toTime?: number
): Money | undefined {
  const { currency } = useCurrencyPref();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const baseAssetContract = useBaseAssetForPool(pool);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const poolTokensResult = usePoolTokens(pool);
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: toBlockNumber } = usePreviousBlockNumber(toTime);
  const [baseAssetFiatPrice] = useTokenPrice(baseAssetContract, currency);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);

  const { data: feeEvents = [] } = useQuery({
    queryKey: [
      ["ConvergentCurvePool", "queryFilter", "FeeCollection"],
      { poolId, fromBlockNumber, toBlockNumber },
    ],
    queryFn: async () => {
      if (!pool || !poolId || !isConvergentCurvePool(pool)) {
        return;
      }

      const filterQuery = pool.filters.FeeCollection(null, null, null, null);

      const events = await pool.queryFilter(
        filterQuery,
        fromBlockNumber,
        toBlockNumber
      );
      return events;
    },
    enabled:
      !!pool && !!poolId && !!fromBlockNumber && isConvergentCurvePool(pool),
  });

  const tokens = getQueryData(poolTokensResult)?.[0];

  if (
    !tokens ||
    !feeEvents ||
    !baseAssetContract ||
    !spotPrice ||
    !baseAssetFiatPrice
  ) {
    return undefined;
  }

  const totalFees = calculateTotalFees(
    feeEvents,
    baseAssetDecimals,
    baseAssetFiatPrice,
    spotPrice
  );

  return totalFees;
}

type PoolBalanceChangedArguments = [
  collectedBase: BigNumber,
  collectedBond: BigNumber,
  remainingBase: BigNumber,
  remainingBond: BigNumber
];
function calculateTotalFees(
  feeEvents: Event[],
  baseAssetDecimals: number | undefined,
  baseAssetFiatPrice: Money,
  spotPrice: number
) {
  let totalFeesBase = BigNumber.from(0);
  let totalFeesBond = BigNumber.from(0);

  feeEvents.forEach((event) => {
    const feeEvent = event?.args as PoolBalanceChangedArguments;
    const [collectedBase, collectedBond] = feeEvent;
    totalFeesBase = totalFeesBase.add(collectedBase);
    totalFeesBond = totalFeesBond.add(collectedBond);
  });

  const baseAssetFees = +formatUnits(totalFeesBase, baseAssetDecimals);
  const yieldAssetFees = +formatUnits(totalFeesBond, baseAssetDecimals);

  const totalFees = baseAssetFiatPrice.multiply(
    baseAssetFees + yieldAssetFees / spotPrice,
    Math.round
  );
  return totalFees;
}
