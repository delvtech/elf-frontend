import { Button, Intent } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { StrategyPreviewCard } from "efi/ui/pools/StrategeyPreviewCard/StrategyPreviewCard";
import { StrategyCard } from "efi/ui/pools/StrategyCard/StrategyCard";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import React, { FC, useCallback, useState } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface InvestViewProps extends RouteComponentProps {}

const investViewClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "overflow-y-scroll"
);

const CardContainer = tw(
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
  const showAvailableStrategies = useCallback(() => {
    setSelectedStrategy(undefined);
  }, []);

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  if (!selectedStrategy) {
    return (
      <div className={investViewClassName}>
        <div className={CardContainer}>
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
    );
  }

  return (
    <div className={investViewClassName}>
      <div className={CardContainer}>
        <Button
          minimal
          outlined
          large
          intent={Intent.PRIMARY}
          onClick={showAvailableStrategies}
        >{t`Show Available Strategies`}</Button>
        <StrategyCard strategy={strategiesById[selectedStrategy]} />
      </div>
    </div>
  );
};
