import React, { FC, useState } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StrategyPreviewCard } from "efi-ui/pools/StrategyPreviewCard/StrategyPreviewCard";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";

interface InvestViewProps extends RouteComponentProps {}

const previewCardContainerClassName = tw(
  "flex",
  "flex-col",
  "flex-1",
  "md:w-1/2",
  "justify-center",
  "items-center",
  "p-3",
  "space-y-3"
);

const availableStrategies = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();
  const [selectedStrategy, setSelectedStrategy] = useState<string>();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  // TODO: Move to own route
  if (selectedStrategy) {
    return (
      <PoolView pool={selectedStrategy} setActivePool={setSelectedStrategy} />
    );
  }

  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Element Pools`} </H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Invest in the latest Defi projects without the fees or hassle of managing everything yourself.`}</span>
        </div>

        {/* Strategy cards */}
        <div className={tw("flex", "w-full", "items-center")}>
          <div className={previewCardContainerClassName}>
            {availableStrategies.map((strategy) => {
              return (
                <StrategyPreviewCard
                  onSelectStrategy={setSelectedStrategy}
                  key={strategy.id}
                  strategy={strategy}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
