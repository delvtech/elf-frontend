import React, { ReactElement } from "react";
import { useQuery } from "react-query";

import { Button, Card, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import BrushChart, { TimeData } from "efi-ui/charts/BrushChart/BrushChart";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";

// const timeData = [
//   { timeMs: Date.parse("2021-01-12"), value: 1077.800674325 },
//   { timeMs: Date.parse("2021-01-13"), value: 1156.5184414717 },
//   { timeMs: Date.parse("2021-01-14"), value: 1238.2550033254 },
//   { timeMs: Date.parse("2021-01-15"), value: 1183.2555122763 },
//   { timeMs: Date.parse("2021-01-16"), value: 1184.195903343 },
//   { timeMs: Date.parse("2021-01-17"), value: 1221.2200249181 },
//   { timeMs: Date.parse("2021-01-18"), value: 1257.0474852058 },
// ];

interface PoolChartsProps {
  pool: PoolContract | undefined;
}
export function PoolCharts({ pool }: PoolChartsProps): ReactElement {
  const liquidityData = useLiquidityHistoryForPool(pool);

  return (
    <div className={tw("flex", "flex-1", "h-500")}>
      <div className={tw("flex", "flex-col", "w-full")}>
        <div className={tw("mb-2", "flex", "space-x-4")}>
          <span>{t`Pool Charts`}</span>
        </div>
        <Card className={tw("flex", "flex-1", "relative")}>
          <div
            className={tw(
              "absolute",
              "w-full",
              "flex",
              "justify-between",
              "pr-10"
            )}
          >
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Liquidity`}</Button>
              <Button
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Volume`}</Button>
            </div>
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Day`}</Button>
            </div>
          </div>
          <div className={tw("w-full", "h-full", "pt-4")}>
            {liquidityData?.length && (
              <BrushChart
                data={liquidityData}
                getXValue={({ timeMs }) => timeMs}
                getYValue={({ value }) => value}
                compact
                isDarkMode
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

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
  const totalLiquidity = useTotalLiquidityForPool(pool);
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const {
    baseAssetContract,
    baseAssetIndex,
    yieldAssetIndex,
  } = parseSortedTokensForPool(tokens);
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);

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
        !totalLiquidity
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

      // the timestamps of all those events
      const timestamps = await Promise.all(
        events.map(async (event) => {
          const block = await event?.getBlock();
          const timestamp = block.timestamp;
          return timestamp;
        })
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
        const timestamp = timestamps[index];

        return [totalDelta, timestamp];
      });

      // reverse events so we start at now and work our way back in time
      deltaEvents.reverse();

      // the actual liquidity in the pool right now (in base asset units)
      const currentLiquidity =
        totalLiquidity?.toDecimal() / baseAssetPrice.toDecimal();

      const liquidityOverTime = deltaEvents.map((event, index) => {
        const [delta, timestamp] = event;

        // if we are at index 0, then the value at [index - 1] will be undefined, so we'll use the
        // currentLiquidity to start
        const previousLiquidity =
          deltaEvents[index - 1]?.[0] ?? currentLiquidity;

        // get total liquidity at each timestamp
        const liquidity = previousLiquidity - delta;

        return [liquidity, timestamp];
      });

      // now put back into correct order
      liquidityOverTime.reverse();

      return liquidityOverTime.map(([liquidity, timestampInSeconds]) => ({
        value: liquidity,
        timeMs: timestampInSeconds * 1000,
      }));
    },
    enabled:
      !!balancerVault &&
      !!poolId &&
      !!fromBlockNumber &&
      !!spotPrice &&
      !!totalLiquidity &&
      !!baseAssetPrice,
  });

  return liquidityEvents;
}
