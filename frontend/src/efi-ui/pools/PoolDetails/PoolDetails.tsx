import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { MarketHistory } from "efi-ui/markets/MarketHistory/MarketHistory";
import { TokenSummary } from "efi-ui/markets/TokenSummary/TokenSummary";
import { VaultSummary } from "efi-ui/markets/VaultSummary/VaultSummary";
import { PoolActionsCard } from "efi-ui/pools/PoolActionsCard/PoolActionsCard";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTotalLiquidityTrend } from "efi-ui/pools/useTotalLiquidityTrend/useTotalLiquidityTrend";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { getBaseAndYieldTokensForPool } from "efi/pools/getBaseAndYieldtokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolDetailsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  pool: PoolContract | undefined;
}

export function PoolDetails({
  library,
  signer,
  account,
  pool,
}: PoolDetailsProps): ReactElement {
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];

  const {
    baseAssetContract,
    yieldAssetContract,
  } = getBaseAndYieldTokensForPool(tokenAddresses);

  const totalLiquidity = useTotalLiquidityForPool(pool);
  const liquidityTrend = useTotalLiquidityTrend(pool);

  const tranche = useTrancheForPool(pool);
  const { data: startDateInUnixSeconds } = useTrancheCreatedAt(tranche);
  const { data: maturityDateInUnixSeconds } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const startDate = (startDateInUnixSeconds || 0) * 1000;
  const maturityDate = (maturityDateInUnixSeconds?.toNumber() || 0) * 1000;

  const { volume24hr, volumeTrend } = useVolumeTrend(pool);
  const { feeVolume24hr, feeVolumeTrend } = useFeeVolumeTrend(pool);

  return (
    <div className={tw("flex", "mb-8", "space-x-4", "w-full", "items-stretch")}>
      <div className={tw("flex", "flex-1")}>
        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          <div className={tw("flex", "space-x-12")}>
            <PoolSummary
              liquidity={totalLiquidity}
              liquidityTrend={liquidityTrend}
              volume={volume24hr}
              volumeTrend={volumeTrend}
              feeVolume={feeVolume24hr}
              feeVolumeTrend={feeVolumeTrend}
            />
            <VaultSummary startDate={startDate} maturityDate={maturityDate} />
            <TokenSummary pool={pool} />
          </div>
          <div className={tw("flex", "space-x-12")}>
            <MarketHistory />
            <PoolActionsCard
              library={library}
              signer={signer}
              account={account}
              pool={pool}
              tokenIn={baseAssetContract}
              tokenOut={yieldAssetContract}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function useFeeVolumeTrend(pool: PoolContract | undefined) {
  const feeVolume24hr = useFeeVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  const feeVolumePrevious24hr = useFeeVolumeForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

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
