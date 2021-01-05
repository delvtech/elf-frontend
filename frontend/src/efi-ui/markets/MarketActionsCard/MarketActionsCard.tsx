import React, { FC } from "react";

import { Button, Card, NonIdealState, Tab, Tabs } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { Pool } from "efi/pools/Pool";
import { t } from "ttag";
import { IconNames } from "@blueprintjs/icons";

interface MarketActionsCardProps {
  pool: Pool;
}

export const MarketActionsCard: FC<MarketActionsCardProps> = ({ pool }) => {
  return (
    <Card className={tw("flex", "flex-col", "w-full", "transition-all")}>
      <Tabs id="market-actions">
        <Tab
          id="trade"
          title={t`Trade`}
          panel={
            <NonIdealState
              icon={IconNames.EXCHANGE}
              description={t`Trade under construction`}
              action={<Button outlined disabled>{t`Trade coming soon`}</Button>}
            />
          }
        />
        <Tab
          id="stake"
          title={t`Stake`}
          panel={
            <NonIdealState
              icon={IconNames.SERIES_ADD}
              description={t`Staking under construction`}
              action={
                <Button outlined disabled>{t`Staking coming soon`}</Button>
              }
            />
          }
        />
      </Tabs>
    </Card>
  );
};
