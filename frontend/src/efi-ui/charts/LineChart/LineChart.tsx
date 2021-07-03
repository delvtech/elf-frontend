import { ReactElement, ReactNode, useEffect, useState } from "react";

import { Colors } from "@blueprintjs/core";
import { AxisProps, GridValues } from "@nivo/axes";
import { Margin } from "@nivo/core";
import {
  CustomLayerProps,
  DatumValue,
  ResponsiveLine,
  Serie,
  SliceTooltipProps,
} from "@nivo/line";
import { LinearScale, TimeScale } from "@nivo/scales";
import { line } from "d3-shape";
import { Currency, Money } from "ts-money";

import tw from "efi-tailwindcss-classnames";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { ONE_WEEK_IN_MILLISECONDS } from "efi/base/time";
import { formatMoney } from "efi/money/formatMoney";

const margin: Partial<Margin> = { top: 40, right: 40, bottom: 60, left: 80 };

const axisBottom: AxisProps = {
  tickSize: 5,
  format: "%a",
  tickValues: getTimeTickValues(),
  tickPadding: 5,
  tickRotation: 0,
  legendOffset: 36,
  legendPosition: "middle",
};

export interface LineChartProps {
  chartType: "lines" | "bars";
  dataLabel: ReactNode;
  darkMode?: boolean;
  data: Serie[];
  formatYValues: (value: number) => string;
}

const now = new Date();
const nowInMs = Date.now();
const weekAgo = new Date(nowInMs - ONE_WEEK_IN_MILLISECONDS);
export function LineChart({
  chartType = "lines",
  dataLabel,
  darkMode,
  data = [],
  formatYValues,
}: LineChartProps): ReactElement {
  const [chartData, setChartData] = useLoadChartData(data);
  useClearDataWhenChartTypeChanges(setChartData, data, chartType);

  const { currency } = useCurrencyPref();
  const { dataColor, textColor, tooltipBackground, tooltipColor } =
    getColors(darkMode);

  const theme = getTheme(textColor);

  const maxDataValue = chartData[0]?.data?.reduce((highestValue, datum) => {
    const currentValue = (datum?.y || 0) as number;
    if (currentValue > highestValue) {
      return currentValue;
    }
    return highestValue;
  }, 0);

  const maxYScale = Math.round(maxDataValue * 1.2) || 100;
  const yScale: LinearScale = {
    type: "linear",
    min: 0,
    max: maxYScale,
    stacked: true,
    reverse: false,
  };

  const CustomLayer = chartType === "lines" ? "lines" : makeBarLayer(dataColor);
  const SliceTooltip = makeSliceTooltip(
    tooltipBackground,
    tooltipColor,
    currency
  );
  const xScale: TimeScale = {
    type: "time",
    min: weekAgo,
    max: now,
  };

  return (
    <div className={tw("flex", "w-full", "h-full")}>
      <ResponsiveLine
        lineWidth={2}
        enableSlices={"x"}
        animate={true}
        data={chartData}
        enableCrosshair={true}
        crosshairType={"x"}
        sliceTooltip={SliceTooltip}
        useMesh={false}
        margin={margin}
        xScale={xScale}
        xFormat="time:%d-%b"
        yScale={yScale}
        yFormat=" >-.2f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        theme={theme}
        colors={[dataColor, "white"]}
        axisBottom={axisBottom}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: dataLabel,
          format: formatYValues,
          legendOffset: -60,
          legendPosition: "middle",
        }}
        enablePoints={false}
        enableArea={chartType === "lines"}
        areaBlendMode="normal"
        layers={[
          "grid",
          "markers",
          "areas",
          "slices",
          "crosshair",
          CustomLayer,
          "axes",
          "points",
          "legends",
        ]}
        legends={[]}
      />
    </div>
  );
}

function useLoadChartData(data: Serie[]): [Serie[], (data: Serie[]) => void] {
  const [chartData, setChartData] = useState<Serie[]>(
    data.map((serie) => ({ ...serie, data: [] }))
  );
  useEffect(() => {
    const animation = setTimeout(() => {
      setChartData(data);
    }, 10);

    return () => {
      clearTimeout(animation);
    };
  }, [data]);

  return [chartData, setChartData];
}
function useClearDataWhenChartTypeChanges(
  setChartData: (data: Serie[]) => void,
  data: Serie[],
  chartType: string
) {
  useEffect(() => {
    setChartData(data.map((serie) => ({ ...serie, data: [] })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType]);
}

function getColors(darkMode: boolean | undefined) {
  return {
    dataColor: darkMode ? Colors.BLUE5 : Colors.BLUE4,
    textColor: darkMode ? "white" : Colors.DARK_GRAY5,
    tooltipBackground: darkMode ? "white" : Colors.DARK_GRAY5,
    tooltipColor: darkMode ? Colors.DARK_GRAY5 : "white",
  };
}
function getTheme(textColor: string) {
  return {
    textColor: textColor,
    grid: {
      line: {
        stroke: textColor,
        strokeOpacity: 0.1,
        strokeDasharray: "1%",
      },
    },
    crosshair: {
      line: {
        stroke: textColor,
        strokeOpacity: 0.5,
        strokeWidth: 1,
      },
    },
  };
}

function makeSliceTooltip(
  tooltipBackground: string,
  tooltipColor: string,
  currency: Currency
) {
  return ({ slice }: SliceTooltipProps) => {
    const value = slice.points[0].data.y as number;
    const money = Money.fromDecimal(value, currency, Math.round);
    return (
      <div
        className={tw("p-2", "px-4", "rounded-sm")}
        style={{
          background: tooltipBackground,
          color: tooltipColor,
          opacity: 1,
        }}
      >
        {formatMoney(money)}
      </div>
    );
  };
}

function makeBarLayer(dataColor: string) {
  return ({ xScale, yScale, data }: CustomLayerProps) => {
    const lineGenerator = line();
    const serieData = data[0].data;
    const pathStrings = serieData
      ?.map((datum) => {
        return lineGenerator([
          [xScale(datum.x as Date), yScale(0)],
          [xScale(datum.x as Date), yScale(datum.y as number)],
        ]);
      })
      ?.filter(Boolean) as string[];

    return (
      <g>
        {pathStrings.map((pathString) => (
          <path
            style={{ pointerEvents: "none" }}
            d={pathString}
            stroke={dataColor}
            strokeWidth={2}
          />
        ))}
      </g>
    );
  };
}

function getTimeTickValues(): GridValues<DatumValue> {
  const date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  const days = [0, 1, 2, 3, 4, 5, 6];

  const dates = days.map((day) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - day);
    return newDate;
  });
  return dates;
}
