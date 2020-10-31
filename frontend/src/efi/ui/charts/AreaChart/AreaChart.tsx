import React, { FunctionComponent, useCallback } from "react";

import { AxisBottom, AxisLeft, AxisScale } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { AppleStock } from "@visx/mock-data/lib/mocks/appleStock";
import { AreaClosed } from "@visx/shape";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { getAxisColor } from "efi/ui/charts/colors";

// Initialize some variables

// accessors
const getDate = (d: AppleStock) => new Date(d.date);
const getStockValue = (d: AppleStock) => d.close;

interface AreaChartProps {
  /**
   * data for the AreaChart
   */
  data: AppleStock[];
  gradientColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
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
  gradientColor,
  width,
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
  const setXScale = useCallback((d) => xScale(getDate(d)) || 0, [xScale]);
  const setYScale = useCallback((d) => yScale(getStockValue(d)) || 0, [yScale]);

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
      <LinearGradient
        id="gradient"
        from={gradientColor}
        fromOpacity={1}
        to={gradientColor}
        toOpacity={0.2}
      />
      <AreaClosed<AppleStock>
        data={data}
        x={setXScale}
        y={setYScale}
        yScale={yScale}
        strokeWidth={1}
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
