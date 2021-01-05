import React, { FC } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketCard } from "efi-ui/markets/MarketsTable/MarketCard/MarketCard";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";

interface MarketViewProps extends RouteComponentProps {}

export const MarketView: FC<MarketViewProps> = () => {
  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Element Market`}</H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Provide liquidity for this market, or trade for what you want.`}</span>
        </div>

        <MarketCard pool={ElfStrategyLowRisk} />
      </div>

      {/* Right hand side */}
      <div
        className={tw(
          "hidden",
          "lg:block",
          "h-full",
          "flex-shrink-0",
          "w-3/10"
        )}
      >
        <WalletSummaryPane />
      </div>
    </div>
  );
};
