import { ReactElement, useMemo, useState } from "react";

import { Callout, Card, H4, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Serie } from "@nivo/line";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LineChart } from "efi-ui/charts/LineChart/LineChart";
import { useVolumeHistoryForPool } from "efi-ui/pools/PoolCharts/useLiquidityVolumeHistoryForPool";
import { usePoolCreatedAt } from "efi-ui/pools/usePoolCreatedAt";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { getPoolContract } from "efi/pools/getPoolContract";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";

import { useLiquidityHistoryForPool } from "./useLiquidityHistoryForPool";

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
  const pool = getPoolContract(poolInfo.address);
  const { isDarkMode } = useDarkMode();
  const {
    volumeData,
    liquidityData,
    setChart,
    showLiquidityChart,
    showVolumeChart,
    poolAtLeastOneDayOld,
  } = usePoolCharts(pool);

  const liquiditySerie = convertTimeDataToSerie(
    liquidityData ?? [],
    "liquidity"
  );
  const volumeSerie = convertTimeDataToSerie(volumeData ?? [], "volume");

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
              <ChartMessages
                poolAtLeastOneDayOld={poolAtLeastOneDayOld}
                hasData={!!liquidityData?.length}
              >
                <LineChart
                  key={isDarkMode ? "a" : "b"}
                  chartType="lines"
                  dataLabel={t`liquidity`}
                  darkMode={isDarkMode}
                  data={liquiditySerie}
                />
              </ChartMessages>
            ) : null}
            {showVolumeChart ? (
              <ChartMessages
                poolAtLeastOneDayOld={poolAtLeastOneDayOld}
                hasData={!!volumeData?.length}
              >
                <LineChart
                  key={isDarkMode ? "a" : "b"}
                  chartType="bars"
                  dataLabel={t`volume`}
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
function usePoolCharts(pool: PoolContract) {
  const poolAtLeastOneDayOld = usePoolAtLeastOneDayOld(pool);

  const liquidityData = useLiquidityHistoryForPool(pool);
  const volumeData = useVolumeHistoryForPool(pool);

  const [activeChart, setChart] = useState(ChartType.LIQUIDITY);
  const showLiquidityChart = activeChart === ChartType.LIQUIDITY;
  const showVolumeChart = activeChart === ChartType.VOLUME;
  return {
    poolAtLeastOneDayOld,
    liquidityData,
    volumeData,
    activeChart,
    setChart,
    showLiquidityChart,
    showVolumeChart,
  };
}

function usePoolAtLeastOneDayOld(pool: PoolContract) {
  const nowInSeconds = useMemo(() => {
    const now = Date.now();
    return Math.round(now / 1000);
  }, []);
  const poolCreatedAt = usePoolCreatedAt(pool) ?? nowInSeconds;

  const poolAge = nowInSeconds - poolCreatedAt;
  const hasEnoughPoolData = poolAge >= ONE_DAY_IN_SECONDS;
  return true;
  // return hasEnoughPoolData;
}

interface ChartMessagesProps {
  poolAtLeastOneDayOld: boolean;
  hasData: boolean;
  children: ReactElement | null;
}

function ChartMessages(props: ChartMessagesProps): ReactElement {
  const { poolAtLeastOneDayOld, hasData, children } = props;

  let message = t`No data available for chart`;
  if (!poolAtLeastOneDayOld) {
    message = t`Charts Available After 24 Hours of Activity`;
  }

  if (!poolAtLeastOneDayOld || !hasData) {
    return (
      <div className={tw("w-full", "h-full", "pt-8")}>
        <Callout
          icon={null}
          className={tw(
            "flex",
            "items-center",
            "justify-center",
            "h-full",
            "w-full"
          )}
          intent={Intent.NONE}
        >
          <H4>{message}</H4>
        </Callout>
      </div>
    );
  }

  return <div className={tw("w-full", "h-full")}>{children}</div>;
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
