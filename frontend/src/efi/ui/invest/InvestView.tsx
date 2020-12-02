import { Classes, H2, Intent, Tag } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import React, { FC, useState } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { InvestBreadcrumb } from "efi/ui/invest/InvestBreadcrumb/InvestBreadcrumb";
import { StrategyCard } from "efi/ui/pools/StrategyCard/StrategyCard";
import { StrategyPreviewCard } from "efi/ui/pools/StrategyPreviewCard/StrategyPreviewCard";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import classNames from "classnames";

interface InvestViewProps extends RouteComponentProps {}

const contentClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "overflow-y-scroll",
  "space-y-10",
  "py-12",
  "pl-12",
  "lg:py-16",
  "lg:pl-16"
);

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

const strategyCardContainerClassName = tw(
  "flex-1",
  "flex",
  "flex-col",
  "w-full",
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

const strategiesById = Object.fromEntries(
  availableStrategies.map((strategy) => [strategy.id, strategy])
);

export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();
  const [selectedStrategy, setSelectedStrategy] = useState<string>();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  // TODO: Move to own compoent for specific StrategyView
  if (selectedStrategy) {
    return (
      <div className={contentClassName}>
        <div className={tw("flex", "w-full", "justify-center", "lg:pt-12")}>
          <InvestBreadcrumb
            availableStrategies={availableStrategies}
            activeStrategy={selectedStrategy}
            setActiveStrategy={setSelectedStrategy}
          />
        </div>

        <div className={strategyCardContainerClassName}>
          <StrategyCard strategy={strategiesById[selectedStrategy]} />
        </div>
      </div>
    );
  }

  return (
    <div className={contentClassName}>
      <div className={tw("flex", "flex-col", "justify-start")}>
        <div>
          <H2 className={tw("mb-4")}>
            {t`Strategies`}{" "}
            <sup>
              <Tag minimal intent={Intent.SUCCESS}>{t`beta`}</Tag>
            </sup>
          </H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Invest in the latest Defi projects without the fees or hassle of managing everything yourself.`}</span>
        </div>
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
  );
};
