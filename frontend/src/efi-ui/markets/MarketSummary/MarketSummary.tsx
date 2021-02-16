import React, { FC } from "react";

import { Card, Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface MarketSummaryProps {
  totalSupply: string | undefined;
}

export const MarketSummary: FC<MarketSummaryProps> = (props) => {
  const { totalSupply } = props;
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
                {totalSupply}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.SUCCESS}>
                .16%
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
                $1,456,789
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
              <div className={classNames("h3", tw("space-x-4"))}>$1,456</div>
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
