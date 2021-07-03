import { ReactElement, useState } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";
import { Serie } from "@nivo/line";
import { format } from "d3-format";
import { commify } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LineChart } from "efi-ui/charts/LineChart/LineChart";
import { ChartMessages } from "efi-ui/pools/PoolCharts/ChartMessagesProps";
import { useVolumeHistoryForPool } from "efi-ui/pools/PoolCharts/useLiquidityVolumeHistoryForPool";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { ONE_WEEK_IN_MILLISECONDS, ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { TimeData } from "efi/charts/TimeData";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

import { useLiquidityHistoryForPool } from "./useLiquidityHistoryForPool";

const nowInMs = Date.now();
const weekAgoMs = nowInMs - ONE_WEEK_IN_MILLISECONDS;

enum ChartType {
  LIQUIDITY = "liquidity",
  VOLUME = "volume",
}

interface PoolChartsProps {
  poolInfo: PoolInfo;
}

export function PoolCharts({ poolInfo }: PoolChartsProps): ReactElement {
  const totalFiatLiquidity = useTotalFiatLiquidity(poolInfo);
  const totalLiquidity = +(totalFiatLiquidity?.toString() || "0");

  const { isDarkMode } = useDarkMode();
  const { volumeData, liquidityData, setChart, showLiquidityChart, poolAge } =
    usePoolCharts(poolInfo);

  const { liquiditySerie, volumeSerie } = convertChartDatasToSeries(
    liquidityData,
    totalLiquidity,
    volumeData
  );

  const { currency } = useCurrencyPref();
  return (
    <div
      className={tw("flex", "flex-1", "h-500")}
      style={{ minHeight: "300px" }}
    >
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
              "z-10",
              "justify-between",
              "pr-10"
            )}
          >
            <Tabs onChange={setChart as (newTabId: ChartType) => void}>
              <Tab id={ChartType.LIQUIDITY} title={t`Liquidity`} />
              <Tab id={ChartType.VOLUME} title={t`Volume`} />
            </Tabs>
          </div>
          <div className={tw("w-full", "h-full", "pt-8")}>
            <ChartMessages poolAgeInSeconds={poolAge} hasData={true}>
              <LineChart
                key={isDarkMode ? "darkline" : "lightline"}
                chartType={showLiquidityChart ? "lines" : "bars"}
                dataLabel={`(${currency.symbol_native})`}
                darkMode={isDarkMode}
                data={showLiquidityChart ? liquiditySerie : volumeSerie}
                formatYValues={formatYValues}
              />
            </ChartMessages>
          </div>
        </Card>
      </div>
    </div>
  );
}
function usePoolCharts(poolInfo: PoolInfo) {
  const poolAge = getPoolAge(poolInfo);

  const liquidityData = useLiquidityHistoryForPool(
    poolInfo,
    ONE_WEEK_IN_SECONDS
  );
  const volumeData = useVolumeHistoryForPool(poolInfo, ONE_WEEK_IN_SECONDS);
  const { currency } = useCurrencyPref();
  const { baseAssetContract } = getPoolTokens(poolInfo);
  const { data: baseAssetPrice } = useTokenPrice(baseAssetContract, currency);
  const fiatPrice = baseAssetPrice?.toDecimal() ?? 1;
  const liquidityFiatData = liquidityData?.map(({ value, timeMs }) => ({
    value: fiatPrice * value,
    timeMs,
  }));
  const volumeFiatData = volumeData?.map(({ value, timeMs }) => ({
    value: fiatPrice * value,
    timeMs,
  }));

  const [activeChart, setChart] = useState(ChartType.LIQUIDITY);
  const showLiquidityChart = activeChart === ChartType.LIQUIDITY;
  const showVolumeChart = activeChart === ChartType.VOLUME;
  return {
    poolAge,
    liquidityData: liquidityFiatData,
    volumeData: volumeFiatData,
    activeChart,
    setChart,
    showLiquidityChart,
    showVolumeChart,
  };
}

function getPoolAge(poolInfo: PoolInfo) {
  const nowInSeconds = Math.floor(nowInMs / 1000);
  const poolCreatedAt = poolInfo.extensions.createdAtTimestamp;

  const poolAge = nowInSeconds - poolCreatedAt;
  return poolAge;
}

function convertChartDatasToSeries(
  liquidityData: TimeData[] | undefined,
  totalLiquidity: number,
  volumeData: TimeData[] | undefined
) {
  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredLiquidityData =
    liquidityData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > weekAgoMs
    ) ?? [];

  // remove data that have the same timestamp
  const dedupedLiquidityData = dedupeLiquidityData(filteredLiquidityData);

  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredVolumeData =
    volumeData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > weekAgoMs
    ) ?? [];

  const liquiditySerie = convertTimeDataToSerie(
    dedupedLiquidityData,
    "liquidity"
  );
  const volumeSerie = convertTimeDataToSerie(filteredVolumeData, "volume");
  return { liquiditySerie, volumeSerie };
}

function convertTimeDataToSerie(timeData: TimeData[], id: string): Serie[] {
  const lineData =
    timeData?.map(({ value, timeMs }) => {
      return {
        x: new Date(timeMs),
        y: value,
      };
    }) ?? [];
  const lineSerie: Serie[] = [
    {
      id,
      data: lineData,
    },
  ];

  return lineSerie;
}

function formatYValues(value: number) {
  const f = format(".2s");

  if (value > 10000) {
    // use 'B' for billion, not 'G' for giga
    return f(value).replace("G", "B");
  }

  return commify(value);
}

// dedupes by timestamp.  if two or more values have the same second value, the last one is kept.
function dedupeLiquidityData(data: TimeData[]): TimeData[] {
  // uniqBy keeps the first duplicate values.  since TimeData should be in chronological order, we
  // reverse the data to keep the last value.
  const copiedData = [...data].reverse();

  const dedupedData = _.uniqBy(copiedData, (datum) => Math.round(datum.timeMs));
  // as long as the previous value occurs at the same second,

  // put order back in ascending chronological order
  dedupedData.reverse();

  return dedupedData;
}
