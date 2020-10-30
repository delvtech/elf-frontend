import React, { Fragment, useCallback, useState } from "react";
import { animated, interpolate, useTransition } from "react-spring";
import { useMeasure } from "react-use";

import { Colors } from "@blueprintjs/core";
import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { scaleOrdinal } from "@visx/scale";
import Pie, { PieArcDatum, ProvidedProps } from "@visx/shape/lib/shapes/Pie";
import tw from "efi-tailwindcss-classnames";
import { getGradientBackgroundColors } from "efi/ui/charts/colors";

const GRADIENT_ID = "pie_gradient";

export interface PieData {
  /**
   * The name of the slice.
   */
  name: string;

  /**
   * Any positive numeric value, PieChart will figure out how much of the pie chart this should occupy
   */
  value: number;

  subData?: PieData[];
}

const tokens: PieData[] = [
  {
    name: "Eth",
    value: 100,
  },
  { name: "DAI", value: 50 },
  {
    name: "ELF-1",
    value: 80,
    subData: [
      { name: "yDAI", value: 100 },
      { name: "yUSDC", value: 300 },
      { name: "yUSDT", value: 150 },
      { name: "yTUSD", value: 150 },
    ],
  },
];

// accessor functions
const getValue = (d: PieData) => d.value;

// color scales
const getDatumColor = scaleOrdinal({
  domain: tokens.map((token) => token.name),
  range: [Colors.BLUE1, Colors.BLUE2, Colors.BLUE3, Colors.BLUE4, Colors.BLUE5],
});

const getSubDatumColor = scaleOrdinal({
  domain: tokens[2]?.subData?.map((token) => token.name),
  range: [Colors.ROSE1, Colors.ROSE2, Colors.ROSE3, Colors.ROSE4, Colors.ROSE5],
});

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

interface PieProps {
  isDarkMode?: boolean;
  width?: number;
  height?: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  pieData?: PieData;
  background?: boolean;
}

export const PieChart: React.FunctionComponent<PieProps> = (props) => {
  const {
    margin = defaultMargin,
    animate = true,
    background = false,
    isDarkMode,
  } = props;

  const pieData = tokens;
  const [ref, dimensions] = useMeasure();
  const width = props.width ?? dimensions.width ?? 0;
  const height = props.height ?? dimensions.height ?? 0;
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const data = selectedSlice
    ? pieData.find(({ name }) => name === selectedSlice)?.subData
    : pieData;

  const onClickDatum = useCallback<(d: PieArcDatum<PieData>) => void>(
    ({ data: { name } }) => {
      const hasSubData = !!pieData.find((d) => d.name === name)?.subData;
      if (!selectedSlice && hasSubData) {
        setSelectedSlice(name);
      } else {
        setSelectedSlice(null);
      }
    },
    [pieData, selectedSlice]
  );

  const getDataColor = useCallback<(d: PieArcDatum<PieData>) => string>(
    ({ data: { name } }) => {
      if (selectedSlice) {
        return getSubDatumColor(name);
      }
      return getDatumColor(name);
    },
    [selectedSlice]
  );

  const { startColor, endColor } = getGradientBackgroundColors({ isDarkMode });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 1.5;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  return (
    <div className={tw("w-full", "h-full")} ref={ref as any}>
      <svg width={width} height={height}>
        {background && (
          <Fragment>
            <rect
              rx={4}
              width={width}
              height={height}
              fill={`url(#${GRADIENT_ID})`}
            />
            <LinearGradient
              id={GRADIENT_ID}
              from={startColor}
              to={endColor}
              rotate={45}
            />
          </Fragment>
        )}
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            data={data}
            pieValue={getValue}
            pieSortValues={() => -1}
            outerRadius={radius - donutThickness * 1.3}
          >
            {(pie) => (
              <AnimatedPie<PieData>
                {...pie}
                animate={animate}
                getKey={({ data: { name } }) => name}
                onClickDatum={onClickDatum}
                getColor={getDataColor}
              />
            )}
          </Pie>
        </Group>
      </svg>
    </div>
  );
};

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(
    arcs,
    getKey,
    // @ts-ignore react-spring doesn't like this overload
    {
      from: animate ? fromLeaveTransition : enterUpdateTransition,
      enter: enterUpdateTransition,
      update: enterUpdateTransition,
      leave: animate ? fromLeaveTransition : enterUpdateTransition,
    }
  );
  return (
    <>
      {transitions.map(
        ({
          item: arc,
          props,
          key,
        }: {
          item: PieArcDatum<Datum>;
          props: AnimatedStyles;
          key: string;
        }) => {
          const [centroidX, centroidY] = path.centroid(arc);
          const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

          return (
            <g key={key}>
              <animated.path
                // compute interpolated path d attribute from intermediate angle values
                d={interpolate(
                  [props.startAngle, props.endAngle],
                  (startAngle, endAngle) =>
                    path({
                      ...arc,
                      startAngle,
                      endAngle,
                    })
                )}
                fill={getColor(arc)}
                onClick={() => onClickDatum(arc)}
                onTouchStart={() => onClickDatum(arc)}
              />
              {hasSpaceForLabel && (
                <animated.g style={{ opacity: props.opacity }}>
                  <text
                    fill="white"
                    x={centroidX}
                    y={centroidY}
                    dy=".33em"
                    fontSize={12}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {getKey(arc)}
                  </text>
                </animated.g>
              )}
            </g>
          );
        }
      )}
    </>
  );
}
