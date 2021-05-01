import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolActionsCard } from "efi-ui/pools/PoolActionsCard/PoolActionsCard";
import { PoolCharts } from "efi-ui/pools/PoolCharts/PoolCharts";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { TokenSummary } from "efi-ui/pools/TokenSummary/TokenSummary";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTotalLiquidityTrend } from "efi-ui/pools/useTotalLiquidityTrend/useTotalLiquidityTrend";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { VaultSummary } from "efi-ui/pools/VaultSummary/VaultSummary";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { APYSummary } from "efi-ui/pools/APYSummary/APYSummary";

interface PoolDetailsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  walletActive: boolean;
  pool: PoolContract | undefined;
}

export function PoolDetails(props: PoolDetailsProps): ReactElement {
  const {
    library,
    signer,
    account,
    chainId,
    connector,
    walletActive,
    pool,
  } = props;
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];

  const { baseAssetContract, termAssetContract } = parseSortedTokensForPool(
    tokenAddresses
  );

  const totalLiquidity = useTotalLiquidityForPool(pool);
  const liquidityTrend = useTotalLiquidityTrend(pool);

  const tranche = useTrancheForPool(pool);
  const startDateInUnixSeconds = useTrancheCreatedAt(tranche);
  const { data: maturityDateInUnixSeconds } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const startDate = (startDateInUnixSeconds || 0) * 1000;
  const maturityDate = (maturityDateInUnixSeconds?.toNumber() || 0) * 1000;

  const { volume24hr, volumeTrend } = useVolumeTrend(pool);
  const { feeVolume24hr, feeVolumeTrend } = useFeeVolumeTrend(pool);

  return (
    <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
      <APYSummary
        pool={pool}
        baseAsset={baseAssetContract}
        startDate={startDate}
        maturityDate={maturityDate}
      />
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-8",
          "lg:space-y-0",
          "lg:grid",
          "lg:grid-flow-row",
          "lg:gap-12",
          "lg:grid-cols-3",
          "lg:auto-rows-max"
        )}
      >
        <PoolSummary
          liquidity={totalLiquidity}
          liquidityTrend={liquidityTrend}
          volume={volume24hr}
          volumeTrend={volumeTrend}
          feeVolume={feeVolume24hr}
          feeVolumeTrend={feeVolumeTrend}
        />
        <VaultSummary
          baseAsset={baseAssetContract}
          startDate={startDate}
          maturityDate={maturityDate}
        />
        <TokenSummary pool={pool} />
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-8",
          "lg:space-y-0",
          "lg:grid",
          "lg:grid-flow-row",
          "lg:gap-12",
          "lg:grid-cols-2",
          "lg:auto-rows-max"
        )}
      >
        <PoolCharts pool={pool} />
        <PoolActionsCard
          library={library}
          signer={signer}
          account={account}
          chainId={chainId}
          connector={connector}
          walletActive={walletActive}
          pool={pool}
          tokenIn={baseAssetContract}
          tokenOut={termAssetContract}
        />
      </div>
    </div>
  );
}

function useFeeVolumeTrend(pool: PoolContract | undefined) {
  const feeVolume24hr = useFeeVolumeFiatForPool(pool, ONE_DAY_IN_SECONDS);
  const feeVolumePrevious24hr = useFeeVolumeFiatForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  if (!feeVolume24hr || !feeVolumePrevious24hr) {
    return {};
  }

  const feeVolumeTrend = getTrend(
    feeVolumePrevious24hr?.toDecimal(),
    feeVolume24hr?.toDecimal()
  );
  return { feeVolume24hr, feeVolumeTrend };
}

function useVolumeTrend(pool: PoolContract | undefined) {
  const volume24hr = useVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  // the volume from 48hrs ago to 24hrs ago
  const volumePrevious24hr = useVolumeForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  const volumeTrend = getTrend(
    volumePrevious24hr?.toDecimal(),
    volume24hr?.toDecimal()
  );
  return { volume24hr, volumeTrend };
}

function getTrend(
  oldValue: number | undefined,
  newValue: number | undefined
): number | undefined {
  if (oldValue === undefined || newValue === undefined) {
    return undefined;
  }

  if (oldValue === 0 || newValue === 0) {
    return 0;
  }

  const trend = (newValue - oldValue) / oldValue;

  return trend;
}
