import React, { FC } from "react";

import { RouteComponentProps, useNavigate } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PoolBreadcrumb } from "efi-ui/pools/PoolBreadCrumb/PoolBreadcrumb";
import { PoolCard } from "efi-ui/pools/PoolCard/PoolCard";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";

interface PoolViewProps extends RouteComponentProps {
  /**
   * the contract address of the pool, provided from router
   */
  poolId?: string;
}

const availablePools = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

const poolsById = Object.fromEntries(
  availablePools.map((pool) => [pool.id, pool])
);

export const PoolView: FC<PoolViewProps> = (props) => {
  const { poolId } = props;

  const { account } = useWallet();
  const navigate = useNavigate();

  if (!account || !poolId) {
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
            availablePools={availablePools}
            activePool={poolId}
            setActivePool={() => navigate(`/${Navigation.POOLS}`)}
          />
        </div>

        <PoolCard pool={poolsById[poolId]} />
      </div>

      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
