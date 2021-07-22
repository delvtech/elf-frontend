import { ReactElement, useState } from "react";

import {
  Button,
  Card,
  Icon,
  Intent,
  Menu,
  MenuItem,
  Position,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { format } from "d3-format";
import { commify } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LineChart } from "efi-ui/charts/LineChart/LineChart";
import { ChartMessages } from "efi-ui/pools/PoolCharts/ChartMessagesProps";
import { useLiquidityHistoryForPool } from "efi-ui/pools/hooks/useLiquidityHistoryForPool";
import { useVolumeHistoryForPool } from "efi-ui/pools/hooks/useLiquidityVolumeHistoryForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { ONE_WEEK_IN_MILLISECONDS, ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { TimeData } from "efi/charts/TimeData";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

import { binDataByDay } from "./helpers/binDataByDay";
import { convertChartDatasToSeries } from "./helpers/convertChartDatasToSeries";

const nowTimestampMs = Date.now();
const weekAgoTimestampMs = nowTimestampMs - ONE_WEEK_IN_MILLISECONDS;

enum ChartType {
  LIQUIDITY = "liquidity",
  VOLUME = "volume",
}

interface PoolChartsProps {
  poolInfo: PoolInfo;
}

export function PoolCharts({ poolInfo }: PoolChartsProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { currency } = useCurrencyPref();
  const [binVolumeData, setBinVolumeData] = useState(true);

  const {
    volumeData: rawVolumeData,
    liquidityData,
    setChart,
    showLiquidityChart,
    poolAge,
  } = usePoolCharts(poolInfo);

  const volumeData = binVolumeData
    ? binDataByDay(rawVolumeData, weekAgoTimestampMs, nowTimestampMs)
    : rawVolumeData;

  const { liquiditySerie, volumeSerie } = convertChartDatasToSeries(
    liquidityData,
    volumeData,
    weekAgoTimestampMs,
    nowTimestampMs
  );

  const labelElement = binVolumeData ? (
    <Icon icon={IconNames.SMALL_TICK} intent={Intent.SUCCESS} />
  ) : undefined;

  return (
    <div
      className={tw("flex", "flex-1", "h-500")}
      style={{ minHeight: "300px" }}
    >
      <div className={tw("flex", "flex-col", "w-full")}>
        <div className={tw("mb-2", "flex", "space-x-4")}>
          <span>{t`Pool Charts`}</span>
        </div>
        <Card className={tw("flex", "flex-1", "flex-col")}>
          <div
            className={tw("w-full", "flex", "z-10", "justify-between", "pr-10")}
          >
            <Tabs onChange={setChart as (newTabId: ChartType) => void}>
              <Tab id={ChartType.LIQUIDITY} title={t`Liquidity`} />
              <Tab id={ChartType.VOLUME} title={t`Volume`} />
            </Tabs>
            {!showLiquidityChart && (
              <Popover2
                content={
                  <Menu>
                    <MenuItem
                      icon={IconNames.GROUPED_BAR_CHART}
                      onClick={() => setBinVolumeData(!binVolumeData)}
                      text={t`Group data`}
                      labelElement={labelElement}
                    />
                  </Menu>
                }
                position={Position.BOTTOM_LEFT}
              >
                <Button icon={IconNames.SETTINGS} />
              </Popover2>
            )}
          </div>
          <div className={tw("w-full", "h-full")}>
            <ChartMessages poolAgeInSeconds={poolAge} hasData={true}>
              <LineChart
                key={isDarkMode ? "darkline" : "lightline"}
                chartType={showLiquidityChart ? "lines" : "bars"}
                groupVolumeData={binVolumeData}
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

  const liquidityData =
    useLiquidityHistoryForPool(poolInfo, ONE_WEEK_IN_SECONDS) ?? [];
  const volumeData =
    useVolumeHistoryForPool(poolInfo, ONE_WEEK_IN_SECONDS) ?? [];
  const { currency } = useCurrencyPref();
  const { baseAssetContract } = getPoolTokens(poolInfo);
  const { data: baseAssetPrice } = useTokenPrice(baseAssetContract, currency);
  const fiatPrice = baseAssetPrice?.toDecimal() ?? 1;
  const liquidityFiatData: TimeData[] = liquidityData.map(
    ({ value, timeMs }) => ({
      value: fiatPrice * value,
      timeMs,
    })
  );
  const volumeFiatData: TimeData[] = volumeData.map(({ value, timeMs }) => ({
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
  const nowInSeconds = Math.floor(nowTimestampMs / 1000);
  const poolCreatedAt = poolInfo.extensions.createdAtTimestamp;

  const poolAge = nowInSeconds - poolCreatedAt;
  return poolAge;
}

function formatYValues(value: number) {
  const f = format(".2s");

  if (value > 10000) {
    // use 'B' for billion, not 'G' for giga
    return f(value).replace("G", "B");
  }

  return commify(value);
}
