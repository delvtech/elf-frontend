import React, { FC, useState } from "react";

import { RouteComponentProps } from "@reach/router";
import tw from "tailwindcss-classnames";

import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { InvestBreadcrumb } from "efi/ui/invest/InvestBreadcrumb/InvestBreadcrumb";
import { StrategyPreviewCard } from "efi/ui/pools/StrategeyPreviewCard/StrategyPreviewCard";
import { StrategyCard } from "efi/ui/pools/StrategyCard/StrategyCard";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";

interface InvestViewProps extends RouteComponentProps {}

const investViewClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "justify-center",
  "items-center",
  "overflow-y-scroll"
);

const previewCardContainerClassName = tw(
  "flex-1",
  "flex",
  "flex-col",
  "w-full",
  "sm:w-1/2",
  "xl:w-1/3",
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

  return (
    <div className={investViewClassName}>
      <div className={tw("flex", "w-full", "justify-center")}>
        <InvestBreadcrumb
          availableStrategies={availableStrategies}
          activeStrategy={selectedStrategy}
          setActiveStrategy={setSelectedStrategy}
        />
      </div>
      {!selectedStrategy ? (
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
      ) : (
        <div className={strategyCardContainerClassName}>
          <StrategyCard strategy={strategiesById[selectedStrategy]} />
        </div>
      )}
    </div>
  );
};
