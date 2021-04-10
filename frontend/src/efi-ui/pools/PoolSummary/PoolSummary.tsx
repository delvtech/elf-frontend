import React, { FC } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TrendIndicator } from "efi-ui/base/TrendIndicator/TrendIndicator";
import { formatMoney } from "efi/money/formatMoney";

interface PoolSummaryProps {
  totalLiquidity: Money | undefined;
  liquidityTrend: number | undefined;
  tradeVolume: Money | undefined;
  volumeTrend: number | undefined;
  swapVolume: Money | undefined;
}

export const PoolSummary: FC<PoolSummaryProps> = (props) => {
  const {
    totalLiquidity,
    liquidityTrend,
    tradeVolume,
    volumeTrend,
    swapVolume,
  } = props;

  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Pool Summary`}</div>
      <Card>
        <div className={tw("flex", "flex-col", "space-y-6")}>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Total Liquidity`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(totalLiquidity)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator trend={liquidityTrend} />
            </div>
          </div>
          {/* Volume (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Volume (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(tradeVolume)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator trend={volumeTrend} />
            </div>
          </div>
          {/* Fees (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Fees (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(swapVolume)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator trend={0.0016} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
