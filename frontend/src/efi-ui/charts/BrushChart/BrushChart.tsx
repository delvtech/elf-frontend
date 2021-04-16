import React, { FC, RefObject, useCallback, useMemo, useState } from "react";
import { useMeasure } from "react-use";

import { Brush } from "@visx/brush";
import { Bounds } from "@visx/brush/lib/types";
import { localPoint } from "@visx/event";
import { LinearGradient } from "@visx/gradient";
import { PatternLines } from "@visx/pattern";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Bar, Line } from "@visx/shape";
import {
  defaultStyles,
  Tooltip,
  TooltipWithBounds,
  withTooltip,
} from "@visx/tooltip";
import { bisector, extent, max } from "d3-array";
import { timeFormat } from "d3-time-format";

import tw from "efi-tailwindcss-classnames";
import AreaChart from "efi-ui/charts/AreaChart/AreaChart";
import { getBrushStyle } from "efi-ui/charts/brush";
import {
  getAccentColor,
  getGradientBackgroundColors,
} from "efi-ui/charts/colors";

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";
const tooltipStyles = {
  ...defaultStyles,
};
const bisectDate = bisector<TimeData, Date>((d) => new Date(d.timeMs)).left;
const formatDate = timeFormat("%b %d, '%y");

export interface TimeData {
  timeMs: number;
  value: number;
}

interface BrushChartProps {
  // TODO: either generalize this further or make this a TimeDataBrushChart
  data: TimeData[];
  // TODO: make BrushChartProps generic like AreaChartProps<T = TimeData> and assign T to datum.
  // spent a little time with this and got into the weeds.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getXValue: (datum: any) => Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getYValue: (datum: any) => number;
  isDarkMode?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
  background?: boolean;
}

export const BrushChart: FC<BrushChartProps> = withTooltip<
  BrushChartProps,
  TimeData
>(
  ({
    data = [],
    getXValue,
    getYValue,
    compact = false,
    isDarkMode = false,
    background = false,
    margin = {
      top: 20,
      left: 50,
      bottom: 20,
      right: 20,
    },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  }) => {
    const [ref, dimensions] = useMeasure();
    const refObject = (ref as unknown) as RefObject<HTMLDivElement>;
    const { width = 0, height = 0 } = dimensions;
    const [filteredData, setFilteredData] = useState(data);

    const onBrushChange = useCallback(
      (domain: Bounds | null) => {
        if (!domain) {
          return;
        }

        const { x0, x1, y0, y1 } = domain;
        const dataCopy = data.filter((d) => {
          const x = getXValue(d).getTime();
          const y = getYValue(d);
          return x > x0 && x < x1 && y > y0 && y < y1;
        });
        setFilteredData(dataCopy);
      },
      [data, getXValue, getYValue]
    );

    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const topChartBottomMargin = compact ? 0 : chartSeparation + 10;
    const topChartHeight = compact
      ? innerHeight - margin.top - margin.bottom
      : 0.8 * innerHeight - topChartBottomMargin;
    const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

    // bounds
    const xMax = Math.max(width - margin.left - margin.right, 0);
    const yMax = Math.max(topChartHeight, 0);
    const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
    const yBrushMax = Math.max(
      bottomChartHeight - brushMargin.top - brushMargin.bottom,
      0
    );

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime<number>({
          range: [0, xMax],
          domain: extent(filteredData, getXValue) as [Date, Date],
        }),
      [xMax, filteredData, getXValue]
    );

    const valueScale = useMemo(
      () =>
        scaleLinear<number>({
          range: [yMax, 0],
          domain: [0, max(filteredData, getYValue) || 0],
          nice: true,
        }),
      [yMax, filteredData, getYValue]
    );
    const brushDateScale = useMemo(
      () =>
        scaleTime<number>({
          range: [0, xBrushMax],
          domain: extent(data, getXValue) as [Date, Date],
        }),
      [data, getXValue, xBrushMax]
    );

    const brushValueScale = useMemo(
      () =>
        scaleLinear({
          range: [yBrushMax, 0],
          domain: [0, max(data, getYValue) || 0],
          nice: true,
        }),
      [data, getYValue, yBrushMax]
    );

    const initialBrushPosition = useMemo(
      () => ({
        start: {
          x: brushDateScale(getXValue(data[Math.floor(data.length * 0.2)])),
        },
        end: {
          x: brushDateScale(getXValue(data[Math.floor(data.length * 0.8)])),
        },
      }),
      [brushDateScale, data, getXValue]
    );
    const onSetFilteredData = useCallback(() => setFilteredData(data), [data]);

    const { startColor, endColor } = getGradientBackgroundColors({
      isDarkMode,
    });

    // tooltip handler
    const handleTooltip = useCallback(
      (
        event:
          | React.TouchEvent<SVGRectElement>
          | React.MouseEvent<SVGRectElement>
      ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getXValue(d1)) {
          d =
            x0.valueOf() - getXValue(d0).valueOf() >
            getXValue(d1).valueOf() - x0.valueOf()
              ? d1
              : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
          tooltipTop: valueScale(getYValue(d)),
        });
      },
      [dateScale, data, getXValue, showTooltip, valueScale, getYValue]
    );
    return (
      <div className={tw("flex", "w-full", "h-full")} ref={refObject}>
        <svg width={width} height={height}>
          {background && (
            <LinearGradient
              id={GRADIENT_ID}
              from={startColor}
              to={endColor}
              rotate={45}
            />
          )}

          <rect
            x={0}
            y={0}
            width={Math.max(width, 0)}
            height={Math.max(height, 0)}
            fill={`url(#${GRADIENT_ID})`}
            rx={4}
          />
          <AreaChart
            hideBottomAxis={!compact}
            data={filteredData}
            getXValue={getXValue}
            getYValue={getYValue}
            width={innerWidth}
            height={innerHeight}
            margin={{ ...margin, bottom: topChartBottomMargin }}
            yMax={yMax}
            xScale={dateScale}
            yScale={valueScale}
            gradientColor={endColor}
          />

          {!compact && (
            <AreaChart
              hideBottomAxis
              hideLeftAxis
              data={data}
              getXValue={getXValue}
              getYValue={getYValue}
              width={width}
              height={height}
              yMax={yBrushMax}
              xScale={brushDateScale}
              yScale={brushValueScale}
              margin={brushMargin}
              top={topChartHeight + topChartBottomMargin + margin.top}
              gradientColor={endColor}
            >
              <PatternLines
                id={PATTERN_ID}
                height={8}
                width={8}
                stroke={getAccentColor({ isDarkMode })}
                strokeWidth={1}
                orientation={["diagonal"]}
              />
              <Brush
                xScale={brushDateScale}
                yScale={brushValueScale}
                width={xBrushMax}
                height={yBrushMax}
                margin={brushMargin}
                handleSize={8}
                resizeTriggerAreas={["left", "right"]}
                brushDirection="horizontal"
                initialBrushPosition={initialBrushPosition}
                onChange={onBrushChange}
                onClick={onSetFilteredData}
                selectedBoxStyle={getBrushStyle({ isDarkMode })}
              />
            </AreaChart>
          )}
          <Bar
            x={margin.left}
            y={margin.top}
            width={Math.max(innerWidth, 0)}
            height={Math.max(innerHeight, 0)}
            fill="transparent"
            rx={14}
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />
          {tooltipData && (
            <g>
              <Line
                from={{ x: tooltipLeft, y: margin.top }}
                to={{ x: tooltipLeft, y: innerHeight - margin.top }}
                stroke={"white"}
                strokeWidth={2}
                pointerEvents="none"
                strokeDasharray="5,2"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + 1 + margin.top}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={tooltipTop + margin.top}
                r={4}
                fill={"white"}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
              />
            </g>
          )}
        </svg>

        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12 + margin.top / 2}
              left={tooltipLeft + 12}
              style={tooltipStyles}
            >
              {`$${getYValue(tooltipData)}`}
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight - margin.top}
              left={tooltipLeft}
              style={{
                ...tooltipStyles,
                minWidth: 72,
                textAlign: "center",
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(getXValue(tooltipData))}
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);

export default BrushChart;
