import { ReactElement, useState } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";
import { Serie } from "@nivo/line";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LineChart } from "efi-ui/charts/LineChart/LineChart";
import { ChartMessages } from "efi-ui/pools/PoolCharts/ChartMessagesProps";
import { useVolumeHistoryForPool } from "efi-ui/pools/PoolCharts/useLiquidityVolumeHistoryForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ONE_WEEK_IN_MILLISECONDS, ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getPoolContract } from "efi/pools/getPoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";

import { useLiquidityHistoryForPool } from "./useLiquidityHistoryForPool";
import { useTotalLiquidity } from "./useTotalLiquidity";

const nowInMs = Date.now();
const weekAgoMs = nowInMs - ONE_WEEK_IN_MILLISECONDS;

export interface TimeData {
  timeMs: number;
  value: number;
}
enum ChartType {
  LIQUIDITY = "liquidity",
  VOLUME = "volume",
}

interface PoolChartsProps {
  poolInfo: PoolInfo;
}
export function PoolCharts({ poolInfo }: PoolChartsProps): ReactElement {
  const totalLiquidity = useTotalLiquidity(poolInfo);

  const { isDarkMode } = useDarkMode();
  const {
    volumeData,
    liquidityData,
    setChart,
    showLiquidityChart,
    showVolumeChart,
    poolAge,
  } = usePoolCharts(poolInfo);

  const { liquiditySerie, volumeSerie } = convertChartDatasToSeries(
    liquidityData,
    totalLiquidity,
    volumeData
  );

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
            {showLiquidityChart ? (
              <ChartMessages poolAgeInSeconds={poolAge} hasData={true}>
                <LineChart
                  key={isDarkMode ? "darkline" : "lightline"}
                  chartType="lines"
                  dataLabel={""}
                  darkMode={isDarkMode}
                  data={liquiditySerie}
                />
              </ChartMessages>
            ) : null}
            {showVolumeChart ? (
              <ChartMessages poolAgeInSeconds={poolAge} hasData={true}>
                <LineChart
                  key={isDarkMode ? "darkbar" : "lightbar"}
                  chartType="bars"
                  dataLabel={""}
                  darkMode={isDarkMode}
                  data={volumeSerie}
                />
              </ChartMessages>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
function usePoolCharts(poolInfo: PoolInfo) {
  const pool = getPoolContract(poolInfo.address);
  const poolAge = getPoolAge(poolInfo);

  const liquidityData = useLiquidityHistoryForPool(pool, ONE_WEEK_IN_SECONDS);
  const volumeData = useVolumeHistoryForPool(pool, ONE_WEEK_IN_SECONDS);

  const [activeChart, setChart] = useState(ChartType.LIQUIDITY);
  const showLiquidityChart = activeChart === ChartType.LIQUIDITY;
  const showVolumeChart = activeChart === ChartType.VOLUME;
  return {
    poolAge,
    liquidityData,
    volumeData,
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
  const filteredLiquidityData =
    liquidityData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > weekAgoMs
    ) ?? [];

  const paddedLiquidityData = padLiquidityData(
    filteredLiquidityData,
    totalLiquidity
  );

  const filteredVolumeData =
    volumeData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > weekAgoMs
    ) ?? [];
  const paddedVolumeData = padVolumeData(filteredVolumeData);

  const liquiditySerie = convertTimeDataToSerie(
    paddedLiquidityData,
    "liquidity"
  );
  const volumeSerie = convertTimeDataToSerie(paddedVolumeData, "volume");
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

function padLiquidityData(
  data: TimeData[],
  totalLiquidity: number
): TimeData[] {
  if (data.length === 0) {
    return [
      { value: totalLiquidity, timeMs: weekAgoMs + 10000 },
      { value: totalLiquidity, timeMs: nowInMs - 10000 },
    ];
  }

  const { value } = data[0];
  return [
    { value, timeMs: weekAgoMs + 10000 },
    ...data,
    { value: totalLiquidity, timeMs: nowInMs - 10000 },
  ];
}

function padVolumeData(data: TimeData[]): TimeData[] {
  if (data.length === 0) {
    return [
      { value: 0, timeMs: weekAgoMs + 10000 },
      { value: 0, timeMs: nowInMs - 10000 },
    ];
  }

  return [
    { value: 0, timeMs: weekAgoMs + 10000 },
    ...data,
    { value: 0, timeMs: nowInMs - 10000 },
  ];
}
