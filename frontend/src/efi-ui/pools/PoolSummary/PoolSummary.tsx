import React, { FC } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TrendIndicator } from "efi-ui/base/TrendIndicator/TrendIndicator";
import { formatMoney } from "efi/money/formatMoney";

interface PoolSummaryProps {
  liquidity: Money | undefined;
  liquidityTrend: number | undefined;
  volume: Money | undefined;
  volumeTrend: number | undefined;
  feeVolume: Money | undefined;
  feeVolumeTrend: number | undefined;
}

export const PoolSummary: FC<PoolSummaryProps> = (props) => {
  const {
    liquidity,
    liquidityTrend,
    volume,
    volumeTrend,
    feeVolume,
    feeVolumeTrend,
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
                {formatMoney(liquidity)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator value={liquidityTrend} />
            </div>
          </div>
          {/* Volume (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Volume (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(volume)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator value={volumeTrend} />
            </div>
          </div>
          {/* Fees (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Fees (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(feeVolume)}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TrendIndicator value={feeVolumeTrend} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
