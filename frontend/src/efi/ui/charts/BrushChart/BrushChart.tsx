import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useMeasure } from "react-use";

import { Brush } from "@visx/brush";
import { Bounds } from "@visx/brush/lib/types";
import { LinearGradient } from "@visx/gradient";
import { PatternLines } from "@visx/pattern";
import { scaleLinear, scaleTime } from "@visx/scale";
import { extent, max } from "d3-array";

import tw from "efi-tailwindcss-classnames";
import AreaChart from "efi/ui/charts/AreaChart/AreaChart";
import { getBrushStyle } from "efi/ui/charts/brush";
import {
  getAccentColor,
  getGradientBackgroundColors,
} from "efi/ui/charts/colors";

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = "brush_pattern";
const GRADIENT_ID = "brush_gradient";

export interface TimeData {
  timeMs: number;
  value: number;
}

interface BrushChartProps {
  // TODO: either generalize this further or make this a TimeDataBrushChart
  data: TimeData[];
  getXValue: (datum: any) => Date;
  getYValue: (datum: any) => number;
  isDarkMode?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
  background?: boolean;
}

export const BrushChart: FunctionComponent<BrushChartProps> = ({
  data = [],
  getXValue,
  getYValue,
  compact = false,
  isDarkMode,
  background = false,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
}) => {
  const [ref, dimensions] = useMeasure();
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
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
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

  const { startColor, endColor } = getGradientBackgroundColors({ isDarkMode });

  return (
    <div className={tw("flex", "w-full", "h-full")} ref={ref as any}>
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
          width={width}
          height={height}
          fill={`url(#${GRADIENT_ID})`}
          rx={4}
        />
        <AreaChart
          hideBottomAxis={compact}
          data={filteredData}
          getXValue={getXValue}
          getYValue={getYValue}
          width={width}
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
      </svg>
    </div>
  );
};

export default BrushChart;
