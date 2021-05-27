import { ReactElement, useMemo, useState } from "react";

import { Callout, Card, H4, Intent, Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import BarChart, { TimeData } from "efi-ui/charts/BarChart/BarChart";
import BrushChart from "efi-ui/charts/BrushChart/BrushChart";
import { useVolumeHistoryForPool } from "efi-ui/pools/PoolCharts/useLiquidityVolumeHistoryForPool";
import { usePoolCreatedAt } from "efi-ui/pools/usePoolCreatedAt";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

import { useLiquidityHistoryForPool } from "./useLiquidityHistoryForPool";
import { EMPTY_ARRAY } from "efi/base/emptyArray";

const getBrushXValue: (data: TimeData) => Date = ({ timeMs }) =>
  new Date(timeMs);
const getYValue: (data: TimeData) => number = ({ value }) => value;
const getBarXValue: (data: TimeData) => Date = ({ timeMs }) => new Date(timeMs);
enum ChartType {
  LIQUIDITY = "liquidity",
  VOLUME = "volume",
}

interface PoolChartsProps {
  pool: PoolContract | undefined;
}
export function PoolCharts(props: PoolChartsProps): ReactElement {
  const { pool } = props;

  const poolChartInfo = usePoolCharts(pool);

  const {
    isDarkMode,
    poolAtLeastOneDayOld,
    liquidityData,
    volumeData,
    setChart,
    showLiquidityChart,
    showVolumeChart,
  } = poolChartInfo;

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
          <div className={tw("w-full", "h-full", "pt-8", "relative")}>
            {!poolAtLeastOneDayOld ? (
              <div className={tw("pt-5", "h-full", "w-full")}>
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
                  <H4>{t`Charts Available After 24 Hours of Activity`}</H4>
                </Callout>
              </div>
            ) : !liquidityData?.length && showLiquidityChart ? (
              <div className={tw("pt-5", "h-full", "w-full")}>
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
                  <H4>{t`No data available for Liquidity chart`}</H4>
                </Callout>
              </div>
            ) : liquidityData?.length &&
              showLiquidityChart &&
              poolAtLeastOneDayOld ? (
              <BrushChart
                data={liquidityData || EMPTY_ARRAY}
                getXValue={getBrushXValue}
                getYValue={getYValue}
                compact
                isDarkMode={isDarkMode}
              />
            ) : !volumeData?.length && showVolumeChart ? (
              <div className={tw("pt-5", "h-full", "w-full")}>
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
                  <H4>{t`No data available for Volume chart`}</H4>
                </Callout>
              </div>
            ) : volumeData?.length &&
              showVolumeChart &&
              poolAtLeastOneDayOld ? (
              <BarChart
                data={volumeData || EMPTY_ARRAY}
                getXValue={getBarXValue}
                getYValue={getYValue}
                // compact
                isDarkMode={isDarkMode}
              />
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
function usePoolCharts(pool: PoolContract | undefined) {
  const { isDarkMode } = useDarkMode();
  const poolAtLeastOneDayOld = usePoolAtLeastOneDayOld(pool);

  const liquidityData = useLiquidityHistoryForPool(pool);
  const volumeData = useVolumeHistoryForPool(pool);

  const [activeChart, setChart] = useState(ChartType.LIQUIDITY);
  const showLiquidityChart = activeChart === ChartType.LIQUIDITY;
  const showVolumeChart = activeChart === ChartType.VOLUME;
  return {
    isDarkMode,
    poolAtLeastOneDayOld,
    liquidityData,
    volumeData,
    activeChart,
    setChart,
    showLiquidityChart,
    showVolumeChart,
  };
}

function usePoolAtLeastOneDayOld(pool: PoolContract | undefined) {
  const nowInSeconds = useMemo(() => {
    const now = Date.now();
    return Math.round(now / 1000);
  }, []);
  const poolCreatedAt = usePoolCreatedAt(pool) ?? nowInSeconds;

  const poolAge = nowInSeconds - poolCreatedAt;
  const hasEnoughPoolData = poolAge >= ONE_DAY_IN_SECONDS;
  return hasEnoughPoolData;
}
