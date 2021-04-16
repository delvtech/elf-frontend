import React, { ReactElement } from "react";

import { Button, Card, Intent } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import BrushChart from "efi-ui/charts/BrushChart/BrushChart";
import { PoolContract } from "efi/pools/PoolContract";
import { useLiquidityHistoryForPool } from "./useLiquidityHistoryForPool";

// const timeData = [
//   { timeMs: Date.parse("2021-01-12"), value: 1077.800674325 },
//   { timeMs: Date.parse("2021-01-13"), value: 1156.5184414717 },
//   { timeMs: Date.parse("2021-01-14"), value: 1238.2550033254 },
//   { timeMs: Date.parse("2021-01-15"), value: 1183.2555122763 },
//   { timeMs: Date.parse("2021-01-16"), value: 1184.195903343 },
//   { timeMs: Date.parse("2021-01-17"), value: 1221.2200249181 },
//   { timeMs: Date.parse("2021-01-18"), value: 1257.0474852058 },
// ];

interface PoolChartsProps {
  pool: PoolContract | undefined;
}
export function PoolCharts({ pool }: PoolChartsProps): ReactElement {
  const liquidityData = useLiquidityHistoryForPool(pool);

  return (
    <div className={tw("flex", "flex-1", "h-500")}>
      <div className={tw("flex", "flex-col", "w-full")}>
        <div className={tw("mb-2", "flex", "space-x-4")}>
          <span>{t`Pool Charts`}</span>
        </div>
        <Card className={tw("flex", "flex-1", "relative")}>
          <div
            className={tw(
              "absolute",
              "w-full",
              "flex",
              "justify-between",
              "pr-10"
            )}
          >
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Liquidity`}</Button>
              <Button
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Volume`}</Button>
            </div>
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Day`}</Button>
            </div>
          </div>
          <div className={tw("w-full", "h-full", "pt-4")}>
            {liquidityData?.length && (
              <BrushChart
                data={liquidityData}
                getXValue={({ timeMs }) => timeMs}
                getYValue={({ value }) => value}
                compact
                isDarkMode
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
