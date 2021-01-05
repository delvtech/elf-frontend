import React, { FC } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { Pool } from "efi/pools/Pool";
import { t } from "ttag";

interface MarketActionsCardProps {
  pool: Pool;
}

export const MarketActionsCard: FC<MarketActionsCardProps> = ({ pool }) => {
  return (
    <Card className={tw("flex", "flex-col", "w-full", "transition-all")}>
      <Tabs id="market-actions">
        <Tab id="trade" title={t`Trade`} panel={<div />} />
        <Tab id="stake" title={t`Stake`} panel={<div />} />
      </Tabs>
    </Card>
  );
};
