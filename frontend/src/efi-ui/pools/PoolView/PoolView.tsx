import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import { InvestBreadcrumb } from "efi-ui/invest/InvestBreadcrumb/InvestBreadcrumb";
import { StrategyCard } from "efi-ui/pools/StrategyCard/StrategyCard";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";

interface PoolViewProps extends RouteComponentProps {
  pool: string;
  setActivePool: (pool: string | undefined) => void;
}

const contentClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "overflow-y-scroll",
  "space-y-10"
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

export const PoolView: FC<PoolViewProps> = ({ pool, setActivePool }) => {
  const { account } = useWallet();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  return (
    <div className={contentClassName}>
      <div className={tw("flex", "w-full", "justify-center", "lg:pt-12")}>
        <InvestBreadcrumb
          availableStrategies={availableStrategies}
          activeStrategy={pool}
          setActiveStrategy={setActivePool}
        />
      </div>

      <div className={strategyCardContainerClassName}>
        <StrategyCard strategy={strategiesById[pool]} />
      </div>
    </div>
  );
};
