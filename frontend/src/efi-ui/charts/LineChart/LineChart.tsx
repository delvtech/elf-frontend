import { ReactElement, RefObject, useMemo } from "react";
import { useMeasure } from "react-use";

import { Colors } from "@blueprintjs/core";
import { Margin } from "@nivo/core";
import {
  CustomLayerProps,
  ResponsiveLine,
  Serie,
  SliceTooltipProps,
} from "@nivo/line";
import { AxisProps } from "@nivo/axes";
import { LinearScale } from "@nivo/scales";
import { line } from "@visx/shape/lib/util/D3ShapeFactories";

import tw from "efi-tailwindcss-classnames";
import { defaultLineData } from "efi-ui/charts/LineChart/defaultLineData";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

const margin: Partial<Margin> = { top: 40, right: 40, bottom: 60, left: 60 };
const xScale: LinearScale = { type: "linear", min: 0, max: 24 };
const yScale: LinearScale = {
  type: "linear",
  min: 0,
  max: "auto",
  stacked: true,
  reverse: false,
};
const axisBottom: AxisProps = {
  tickSize: 5,
  tickPadding: 5,
  tickRotation: 0,
  legendOffset: 36,
  legendPosition: "middle",
};

export interface LineChartProps {
  chartType: "lines" | "bars";
  dataLabel: string;
  darkMode?: boolean;
  data: Serie[];
}

export function LineChart({
  chartType = "lines",
  dataLabel,
  darkMode,
  data = defaultLineData,
}: LineChartProps): ReactElement {
  const { refObject, containerStyle } = useContainer();

  const { dataColor, textColor, tooltipBackground, tooltipColor } =
    getColors(darkMode);

  const theme = getTheme(textColor);

  const CustomLayer = chartType === "lines" ? "lines" : makeBarLayer(dataColor);
  const SliceTooltip = makeSliceToolptip(tooltipBackground, tooltipColor);

  return (
    <div className={tw("flex", "w-full", "h-full")} ref={refObject}>
      <div style={containerStyle}>
        <ResponsiveLine
          lineWidth={2}
          enableSlices={"x"}
          data={defaultLineData}
          enableCrosshair={true}
          crosshairType={"x"}
          sliceTooltip={SliceTooltip}
          margin={margin}
          xScale={xScale}
          yScale={yScale}
          yFormat=" >-.2f"
          curve="cardinal"
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
            legendOffset: -40,
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
    </div>
  );
}

function useContainer() {
  const [ref, dimensions] = useMeasure();
  const refObject = ref as unknown as RefObject<HTMLDivElement>;
  const { width = 0, height = 0 } = dimensions;
  const containerStyle = useMemo(() => ({ height, width }), [height, width]);
  return { refObject, containerStyle };
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

function makeSliceToolptip(tooltipBackground: string, tooltipColor: string) {
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
          [xScale(datum.x as number), yScale(0)],
          [xScale(datum.x as number), yScale(datum.y as number)],
        ]);
      })
      .filter(Boolean) as string[];

    return (
      <g>
        {pathStrings.map((pathString) => (
          <path d={pathString} stroke={dataColor} strokeWidth={2} />
        ))}
      </g>
    );
  };
}
