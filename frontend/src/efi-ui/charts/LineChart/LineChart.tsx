// install (please make sure versions match peerDependencies)
import { ReactElement, RefObject, useMemo } from "react";

// yarn add @nivo/core @nivo/line
import { ResponsiveLine, Serie } from "@nivo/line";
import { useMeasure } from "react-use";
import tw from "efi-tailwindcss-classnames";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

export interface LineChartProps {
  data: Serie[];
}
export function LineChart({
  data /* see data tab */,
}: LineChartProps): ReactElement {
  const [ref, dimensions] = useMeasure();
  const refObject = (ref as unknown) as RefObject<HTMLDivElement>;
  const { width = 0, height = 0 } = dimensions;
  const containerStyle = useMemo(() => ({ height, width }), [height, width]);
  return (
    <div className={tw("flex", "w-full", "h-full")} ref={refObject}>
      <div style={containerStyle}>
        <ResponsiveLine
          data={data}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: "linear" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false,
          }}
          yFormat=" >-.2f"
          curve="basis"
          axisTop={null}
          axisRight={null}
          axisBottom={
            {
              orient: "bottom",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "transportation",
              legendOffset: 36,
              legendPosition: "middle",
            } as any
          }
          axisLeft={
            {
              orient: "left",
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "count",
              legendOffset: -40,
              legendPosition: "middle",
            } as any
          }
          enablePoints={false}
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaBlendMode="multiply"
          crosshairType="x"
          useMesh={true}
          legends={[]}
        />
      </div>
    </div>
  );
}
