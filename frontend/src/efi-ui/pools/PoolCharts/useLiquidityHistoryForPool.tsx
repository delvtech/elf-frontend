import { useQuery } from "react-query";

import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { TimeData } from "efi-ui/charts/BrushChart/BrushChart";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import {
  AVG_MINE_RATE_SECONDS,
  usePreviousBlockNumber,
} from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

type PoolBalanceChangedArguments = [
  poolId: string,
  sender: string,
  assets: string[],
  amounts: BigNumber[],
  dueProtocolFeeAmounts: BigNumber[]
];
/**
 * Returns the amount of liquidity added or removed for each token in a time
 * period.
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds to query back to from now.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */

export function useLiquidityHistoryForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS
): TimeData[] | undefined {
  const totalLiquidity = useTotalFiatLiquidityForPool(pool);
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const {
    baseAssetContract,
    baseAssetIndex,
    termAssetIndex: yieldAssetIndex,
  } = parseSortedTokensForPool(tokens);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

  const { data: lastestBlockNumber } = useLatestBlockNumber();
  const nowInMs = Date.now();

  // TODO: break this up into a query to grab the PoolBalanceChanged events, and another query to
  // get the timestamps
  const { data: liquidityEvents = [] } = useQuery({
    queryKey: [
      ["balancerVault", "queryFilter", "PoolBalanceChanged", "liquidityEvents"],
      { poolId, fromBlockNumber, spotPrice },
    ],
    queryFn: async () => {
      if (
        !balancerVault ||
        !poolId ||
        !spotPrice ||
        !baseAssetPrice ||
        !totalLiquidity ||
        !lastestBlockNumber
      ) {
        return;
      }

      const filterQuery = balancerVault.filters.PoolBalanceChanged(
        poolId,
        null,
        null,
        null,
        null
      );

      // these are all the events that have liquidity changes when people stake/unstake from the
      // pool.
      const events = await balancerVault.queryFilter(
        filterQuery,
        fromBlockNumber
      );

      // here we take those events, and combine the base and yield asset into a single delta value.
      // we combine that with the timestamp to get a time series of data: [baseAssetDelta,
      // timestamp]. however, to see changes in total liquidity over time. to do this we get the
      // current total liquidity, and working backwards, we subtract the delta to see how the total
      // liquidity has changed over time. i.e.:
      //
      // deltaEvents = [ [+5, 0001], [-3, 0002], [+6, 003] ];
      // currentLiquidity = 100;
      // liquidityOvertime = [ [92, 001], [97, 002], [94, 003] ];
      //                                              ^
      // start here ---------------------------------/
      // take 100 - 6 = 94 and work backwards
      const deltaEvents = events.map((event, index) => {
        const changeEvent = event?.args as PoolBalanceChangedArguments;
        const { blockNumber } = event;
        const [, , , amounts] = changeEvent;
        const baseDelta = +formatUnits(
          amounts[baseAssetIndex],
          baseAssetDecimals
        );
        const yieldDelta = +formatUnits(
          amounts[yieldAssetIndex],
          baseAssetDecimals
        );

        // liquidity delta in base asset units
        const totalDelta = baseDelta + yieldDelta / spotPrice;

        // estimating timestamp here by taking the current time and subtracting the mining rate
        // multiplied by the number blocks mined:
        const timeStamp =
          nowInMs -
          (lastestBlockNumber - blockNumber) * AVG_MINE_RATE_SECONDS * 1000;

        return [totalDelta, timeStamp];
      });

      // reverse events so we start at now and work our way back in time
      deltaEvents.reverse();

      // the actual liquidity in the pool right now (in base asset units)
      const currentLiquidity =
        totalLiquidity.toDecimal() / baseAssetPrice.toDecimal();

      const liquidityOverTime: number[][] = [];

      deltaEvents.forEach((event, index) => {
        const [delta, timestamp] = event;

        // if we are at index 0, then the value at [index - 1] will be undefined, so we'll use the
        // currentLiquidity to start
        const previousLiquidity =
          liquidityOverTime[index - 1]?.[0] ?? currentLiquidity;

        // get total liquidity at each timestamp
        const liquidity = previousLiquidity - delta;
        liquidityOverTime.push([liquidity, timestamp]);
      });

      // now put back into correct order
      liquidityOverTime.reverse();

      return liquidityOverTime.map(([liquidity, timestampInSeconds]) => ({
        value: liquidity,
        timeMs: timestampInSeconds,
      }));
    },
    enabled:
      !!balancerVault &&
      !!poolId &&
      !!fromBlockNumber &&
      !!spotPrice &&
      !!totalLiquidity &&
      !!baseAssetPrice &&
      !!lastestBlockNumber,
  });

  return liquidityEvents;
}
