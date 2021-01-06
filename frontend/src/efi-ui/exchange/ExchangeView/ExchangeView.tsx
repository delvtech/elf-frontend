import React, { FC } from "react";

import { Card, Classes, H2 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketFilterOptions } from "efi-ui/markets/MarketFilterOptions/MarketFilterOptions";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { Pool } from "efi/pools/Pool";

interface ExchangeViewProps extends RouteComponentProps {}

// TODO: change this to a list of Markets
const availableMarkets: Pool[] = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

export const ExchangeView: FC<ExchangeViewProps> = () => {
  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Element Exchange`}</H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Invest in the latest Defi projects without the fees or hassle of managing everything yourself.`}</span>
        </div>

        <div className={tw("flex", "space-x-12")}>
          {/* Right hand side */}
          <div
            className={tw(
              "hidden",
              "lg:block",
              "h-full",
              "flex-shrink-0",
              "w-64"
            )}
          >
            <MarketFilterOptions />
          </div>
          <div className={tw("flex", "flex-1")}>
            <Card className={tw("p-10", "flex", "flex-1")}>
              <MarketsTable
                className={tw("w-full")}
                markets={availableMarkets}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
