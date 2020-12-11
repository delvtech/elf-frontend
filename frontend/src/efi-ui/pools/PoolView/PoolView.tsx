import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import { PoolBreadcrumb } from "efi-ui/pools/PoolBreadCrumb/PoolBreadcrumb";
import { PoolCard } from "efi-ui/pools/PoolCard/PoolCard";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";

interface PoolViewProps extends RouteComponentProps {
  pool: string;
  setActivePool: (pool: string | undefined) => void;
}

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
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-16")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <PoolBreadcrumb
            availablePools={availableStrategies}
            activePool={pool}
            setActivePool={setActivePool}
          />
        </div>

        <PoolCard strategy={strategiesById[pool]} />
      </div>

      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
