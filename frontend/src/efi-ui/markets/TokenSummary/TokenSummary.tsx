import React, { FC } from "react";

import { Card, Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketAsset } from "efi/markets/Market";

interface TokenSummaryProps {
  baseAsset: MarketAsset | undefined;
  yieldAsset: MarketAsset | undefined;
}

// TODO: handle loading states
export const TokenSummary: FC<TokenSummaryProps> = (props) => {
  const { baseAsset, yieldAsset } = props;
  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Tokens`}</div>
      <div className={tw("flex", "flex-col", "space-x-4")}>
        <Card className={tw("flex", "space-x-8")}>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>{baseAsset?.name}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"$1,234"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
          </div>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>{yieldAsset?.name}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"$1,234"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
