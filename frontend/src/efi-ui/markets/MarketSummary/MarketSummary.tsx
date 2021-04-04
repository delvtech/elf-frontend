import React, { FC } from "react";

import { Card, Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { formatMoney } from "efi/money/formatMoney";
import { formatPercent } from "efi/base/formatPercent";

interface MarketSummaryProps {
  totalLiquidity: Money | undefined;
  liquidityTrend: number | undefined;
  tradeVolume: Money | undefined;
  swapVolume: Money | undefined;
}

export const MarketSummary: FC<MarketSummaryProps> = (props) => {
  const { totalLiquidity, liquidityTrend, tradeVolume, swapVolume } = props;

  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Market Summary`}</div>
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
              <Tag minimal intent={Intent.SUCCESS}>
                {formatPercent(liquidityTrend || 0)}
                <Icon icon={"caret-up"} />
              </Tag>
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
              <Tag minimal intent={Intent.DANGER}>
                .16%
                <Icon icon={"caret-down"} />
              </Tag>
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
              <Tag minimal intent={Intent.SUCCESS}>
                .16%
                <Icon icon={"caret-up"} />
              </Tag>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
