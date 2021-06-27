import { ReactElement, ReactNode } from "react";

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

import tw from "efi-tailwindcss-classnames";
import { ONE_WEEK_IN_MILLISECONDS } from "efi/base/time";
import { line } from "d3-shape";

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
  data,
  formatYValues,
}: LineChartProps): ReactElement {
  const { dataColor, textColor, tooltipBackground, tooltipColor } =
    getColors(darkMode);

  const theme = getTheme(textColor);

  const maxDataValue = data[0].data.reduce((highestValue, datum) => {
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
  const SliceTooltip = makeSliceTooltip(tooltipBackground, tooltipColor);
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
        animate={false}
        data={data}
        enableCrosshair={true}
        crosshairType={"x"}
        sliceTooltip={SliceTooltip}
        useMesh={false}
        margin={margin}
        xScale={xScale}
        xFormat="time:%d-%b"
        yScale={yScale}
        yFormat=" >-.2f"
        curve="catmullRom"
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

function makeSliceTooltip(tooltipBackground: string, tooltipColor: string) {
  return ({ slice }: SliceTooltipProps) => {
    return (
      <div
        className={tw("p-2", "px-4", "rounded-sm")}
        style={{
          background: tooltipBackground,
          color: tooltipColor,
          opacity: 1,
        }}
      >
        {slice.points[0].data.y}
      </div>
    );
  };
}

function makeBarLayer(dataColor: string) {
  return ({ xScale, yScale, data }: CustomLayerProps) => {
    const lineGenerator = line();
    const serieData = data[0].data;
    const pathStrings = serieData
      .map((datum) => {
        return lineGenerator([
          [xScale(datum.x as Date), yScale(0)],
          [xScale(datum.x as Date), yScale(datum.y as number)],
        ]);
      })
      .filter(Boolean) as string[];

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
