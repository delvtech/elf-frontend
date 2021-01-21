import { AxisBottom, AxisLeft, AxisScale } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { AreaClosed, LinePath } from "@visx/shape";
import React, { FunctionComponent, useCallback } from "react";

import { getAxisColor } from "efi-ui/charts/colors";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { GridColumns, GridRows } from "@visx/grid";
import { Colors } from "@blueprintjs/core";

interface TimeData {
  timeMs: number;
  value: number;
}

interface AreaChartProps {
  /**
   * data for the AreaChart
   */
  data: TimeData[];
  getXValue: (datum: any) => Date;
  getYValue: (datum: any) => number;
  gradientColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
  height: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: React.ReactNode;
}

export const AreaChart: FunctionComponent<AreaChartProps> = ({
  data,
  getXValue,
  getYValue,
  gradientColor,
  width,
  height,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
}) => {
  const setXScale = useCallback((d) => xScale(getXValue(d)) ?? 0, [
    getXValue,
    xScale,
  ]);
  const setYScale = useCallback((d) => yScale(getYValue(d)) ?? 0, [
    getYValue,
    yScale,
  ]);

  const { isDarkMode } = useDarkMode();

  if (width < 10) {
    return null;
  }

  const axisColor = getAxisColor({ isDarkMode });
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
        height={height - margin.top - margin.bottom}
        stroke="#e0e0e0"
        strokeDasharray="1,3"
        strokeOpacity={0.2}
      />
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <LinePath
        data={data}
        curve={curveMonotoneX}
        x={setXScale}
        y={setYScale}
        stroke={"white"}
        strokeWidth={5}
        strokeOpacity={0.8}
      />
      <AreaClosed<TimeData>
        data={data}
        x={setXScale}
        y={setYScale}
        yScale={yScale}
        stroke="url(#gradient)"
        fill="url(#gradient)"
        curve={curveMonotoneX}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={setAxisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={width > 520 ? 5 : 2}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={setAxisLeftTickLabelProps}
        />
      )}
      {children}
    </Group>
  );
};

export default AreaChart;
