import React, { FC } from "react";

import { RouteComponentProps, useNavigate } from "@reach/router";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PoolBreadcrumb } from "efi-ui/pools/PoolBreadCrumb/PoolBreadcrumb";
import { PoolCard } from "efi-ui/pools/PoolCard/PoolCard";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";

import { PoolNotFoundCard } from "../PoolNotFoundCard/PoolNotFoundCard";

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

  const navigate = useNavigate();

  const pool = poolId ? poolsById[poolId] : null;
  const activePool = pool ? poolId : undefined;

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
            activePool={activePool}
            setActivePool={() => navigate(`/${Navigation.POOLS}`)}
          />
        </div>

        {pool ? <PoolCard pool={pool} /> : <PoolNotFoundCard />}
      </div>

      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
