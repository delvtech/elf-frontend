import { ReactElement, RefObject, useMemo } from "react";

import {
  CustomLayerProps,
  PointSymbolProps,
  ResponsiveLine,
  Serie,
} from "@nivo/line";
import { useMeasure } from "react-use";
import tw from "efi-tailwindcss-classnames";
import { defaultLineData } from "efi-ui/charts/LineChart/defaultLineData";
import { t } from "ttag";
import { line } from "@visx/shape/lib/util/D3ShapeFactories";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

export interface LineChartProps {
  type: "lines" | "bars";
  data: Serie[];
}

export function LineChart({
  type = "lines",
  data = defaultLineData,
}: LineChartProps): ReactElement {
  const [ref, dimensions] = useMeasure();
  const refObject = ref as unknown as RefObject<HTMLDivElement>;
  const { width = 0, height = 0 } = dimensions;

  const CustomLayer = type === "lines" ? "lines" : BarLayer;
  const containerStyle = useMemo(() => ({ height, width }), [height, width]);
  return (
    <div className={tw("flex", "w-full", "h-full")} ref={refObject}>
      <div style={containerStyle}>
        <ResponsiveLine
          lineWidth={2}
          enableSlices={"x"}
          data={defaultLineData}
          enableCrosshair={true}
          crosshairType={"x"}
          sliceTooltip={({ slice }) => {
            return (
              <div
                className={tw("p-2", "px-4", "rounded-sm")}
                style={{ background: "white", color: "grey", opacity: 1 }}
              >
                {slice.points[0].data.y}
              </div>
            );
          }}
          margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
          xScale={{ type: "linear", min: 0, max: 24 }}
          yScale={{
            type: "linear",
            min: 0,
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="cardinal"
          axisTop={null}
          axisRight={null}
          theme={{
            textColor: "white",
            grid: { line: { strokeOpacity: 0.1, strokeDasharray: "1%" } },
            crosshair: {
              line: {
                stroke: "white",
                strokeOpacity: 1,
              },
            },
          }}
          colors={["#3daff7", "white"]}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legendOffset: 36,
            legendPosition: "middle",
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: t`liquidity`,
            legendOffset: -40,
            legendPosition: "middle",
          }}
          pointSymbol={(props: PointSymbolProps) => {
            return (
              <g>
                <line
                  strokeWidth={2}
                  stroke="white"
                  x={props.datum.x as number}
                  y={props.datum.y as number}
                  y1={0}
                />
              </g>
            );
          }}
          enablePoints={true}
          enableArea={type === "lines"}
          areaBlendMode="normal"
          layers={[
            "grid",
            "markers",
            "areas",
            "slices",
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
function BarLayer({ xScale, yScale, data }: CustomLayerProps) {
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
        <path d={pathString} stroke="#3daff7" strokeWidth={2} />
      ))}
    </g>
  );
}
