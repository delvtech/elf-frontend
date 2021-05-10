import React, { ReactElement, useCallback } from "react";

import { AxisBottom, AxisLeft, AxisScale } from "@visx/axis";
import { GridColumns, GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";

import { getAxisColor } from "efi-ui/charts/colors";

// Initialize some variables
const margin = { top: 10, bottom: 15, left: 50, right: 20 };
interface BarsProps<D> {
  data: D[];
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  isDarkMode?: boolean;
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  getXValue: (value: D) => Date;
  getYValue: (datum: D) => number;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
}

export default function Bars<D>({
  data,
  getXValue,
  getYValue,
  width,
  height,
  isDarkMode = false,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top = 0,
  left = 0,
  xScale,
  yScale,
}: BarsProps<D>): ReactElement | null {
  // bounds
  const yMax = height - margin.top - margin.bottom;

  const axisColor = getAxisColor({ isDarkMode });
  const barColor = axisColor;

  const setXScale = useCallback(
    (d) => xScale(getXValue(d)) ?? 0,
    [getXValue, xScale]
  );
  const setYScale = useCallback(
    (d) => yScale(getYValue(d)) ?? 0,
    [getYValue, yScale]
  );

  const axisBottomTickLabelProps = {
    textAnchor: "middle" as const,
    fontSize: 10,
    fill: axisColor,
  };
  const setAxisBottomTickLabelProps = () => axisBottomTickLabelProps;

  const axisLeftTickLabelProps = {
    dx: "-0.25em",
    dy: "0.25em",
    fontFamily: "Arial",
    fontSize: 10,
    textAnchor: "end" as const,
    fill: axisColor,
  };
  const setAxisLeftTickLabelProps = () => axisLeftTickLabelProps;

  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <GridRows
        scale={yScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
        strokeDasharray="1,3"
        strokeOpacity={0.2}
      />
      <GridColumns
        scale={xScale}
        width={width}
        height={height}
        stroke="#e0e0e0"
        strokeDasharray="1,3"
        strokeOpacity={0.2}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax + margin.top + margin.bottom}
          scale={xScale}
          numTicks={width > 520 ? 5 : 5}
          stroke={"white"}
          tickStroke={axisColor}
          tickLabelProps={setAxisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={width > 520 ? 5 : 2}
          stroke={"white"}
          tickStroke={axisColor}
          tickLabelProps={setAxisLeftTickLabelProps}
        />
      )}
      {data.map((d) => {
        const xValue = getXValue(d);
        // const barWidth = xScale.bandwidth();
        const barHeight = yMax - (yScale(getYValue(d)) ?? 0);
        const barX = setXScale(d);
        const barY = setYScale(d) + margin.top + margin.bottom;
        return (
          <Bar
            key={`bar-${xValue}`}
            x={barX}
            y={barY}
            width={2}
            height={Math.max(barHeight, 0)}
            fill={barColor}
          />
        );
      })}
    </Group>
  );
}
