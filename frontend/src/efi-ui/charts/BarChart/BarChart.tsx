import React, { FC, RefObject, useMemo } from "react";
import { useMeasure } from "react-use";

import { scaleLinear, scaleTime } from "@visx/scale";
import { withTooltip } from "@visx/tooltip";
import { extent, max } from "d3-array";

import tw from "efi-tailwindcss-classnames";
import Bars from "efi-ui/charts/BarChart/Bars";

// Initialize some variables
const GRADIENT_ID = "brush_gradient";
// const bisectDate = bisector<TimeData, Date>((d) => new Date(d.timeMs)).left;
// const formatDate = timeFormat("%b %d, '%y");

export interface TimeData {
  timeMs: number;
  value: number;
}

interface BarChartProps {
  data: TimeData[];
  getXValue: (datum: TimeData) => Date;
  getYValue: (datum: TimeData) => number;
  isDarkMode?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const BarChart: FC<BarChartProps> = withTooltip<BarChartProps, TimeData>(
  ({
    data = [],
    getXValue,
    getYValue,
    isDarkMode = false,
    margin = {
      top: 20,
      left: 50,
      bottom: 50,
      right: 20,
    },
  }) => {
    const [ref, dimensions] = useMeasure();
    const refObject = ref as unknown as RefObject<HTMLDivElement>;
    const { width = 0, height = 0 } = dimensions;

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    // bounds
    const xMax = Math.max(width - margin.left - margin.right, 0);
    const yMax = Math.max(innerHeight, 0);

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime<number>({
          range: [0, xMax],
          domain: extent(data, getXValue) as [Date, Date],
        }),
      [xMax, data, getXValue]
    );

    const valueScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, max(data, getYValue) || 0],
          nice: true,
        }),
      [yMax, data, getYValue]
    );

    return (
      <div className={tw("flex", "w-full", "h-full")} ref={refObject}>
        <svg width={width} height={height}>
          <rect
            x={0}
            y={0}
            width={Math.max(width, 0)}
            height={Math.max(height, 0)}
            fill={`url(#${GRADIENT_ID})`}
            rx={4}
          />
          <Bars<TimeData>
            data={data}
            getXValue={getXValue}
            getYValue={getYValue}
            width={innerWidth}
            height={innerHeight}
            margin={margin}
            xScale={dateScale}
            yScale={valueScale}
            isDarkMode={isDarkMode}
          />
        </svg>
      </div>
    );
  }
);

export default BarChart;
