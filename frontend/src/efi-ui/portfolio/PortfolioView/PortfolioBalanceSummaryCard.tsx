import React, { FC } from "react";

import { Card, Classes, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import classNames from "classnames";

interface PortfolioBalanceSummaryCardProps {}

export const PortfolioBalanceSummaryCard: FC<PortfolioBalanceSummaryCardProps> = () => {
  return (
    <Card className={tw("p-8", "space-y-4")}>
      {[
        { label: t`Fixed yield tokens (FYTs)`, value: "$50,201.09" },
        { label: t`Yield coupons (YCs)`, value: "$0.00" },
        { label: t`Liquidity positions`, value: "$0.00" },
        {
          label: t`Element token`,
          value: "Under construction",
          className: Classes.TEXT_MUTED,
        },
      ].map(({ label, value, className }) => (
        <div
          key={label}
          className={classNames(
            tw("w-full", "grid", "grid-cols-2", "gap-1"),
            className
          )}
        >
          <span>{label}</span>
          <span className={tw("text-right")}>{value}</span>
        </div>
      ))}
      <Tag minimal large fill>
        <div
          className={tw("text-base", "w-full", "grid", "grid-cols-2", "gap-4")}
        >
          <span>{t`Total`}</span>
          <span className={tw("text-right")}>$50,281.09</span>
        </div>
      </Tag>
    </Card>
  );
};
