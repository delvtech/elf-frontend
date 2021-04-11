import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { FixedYieldSummary } from "efi-ui/markets/FixedYieldSummary/FixedYieldSummary";
import { PoolActionsCard } from "efi-ui/markets/MarketActionsCard/PoolActionsCard";
import { MarketHistory } from "efi-ui/markets/MarketHistory/MarketHistory";
import { TokenSummary } from "efi-ui/markets/TokenSummary/TokenSummary";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTotalLiquidityTrend } from "efi-ui/pools/useTotalLiquidityTrend/useTotalLiquidityTrend";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolDetailsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  pool: PoolContract | undefined;
}

export const PoolDetails: FC<PoolDetailsProps> = ({
  library,
  signer,
  account,
  pool,
}) => {
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];
  const [tokenIn, tokenOut] = useSmartContractsFromFactory(
    tokenAddresses,
    ERC20__factory.connect
  );
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

  const volume24hr = useVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  // the volume from 48hrs ago to 24hrs ago
  const volumePrevious24hr = useVolumeForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  const newVolume = volume24hr?.toDecimal() ?? 0;
  const oldVolume = volumePrevious24hr?.toDecimal() ?? 0;

  const volumeTrend = (newVolume - oldVolume) / oldVolume;

  const feeVolume24hr = useFeeVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  const feeVolumePrevious24hr = useFeeVolumeForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  const newFeeVolume = feeVolume24hr?.toDecimal() ?? 0;
  const oldFeeVolume = feeVolumePrevious24hr?.toDecimal() ?? 0;
  const feeVolumeTrend = (newFeeVolume - oldFeeVolume) / oldFeeVolume;

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
            <FixedYieldSummary
              startDate={startDate}
              maturityDate={maturityDate}
            />
            <TokenSummary pool={pool} />
          </div>
          <div className={tw("flex", "space-x-12")}>
            <MarketHistory />
            <PoolActionsCard
              library={library}
              signer={signer}
              account={account}
              pool={pool}
              tokenIn={tokenIn}
              tokenOut={tokenOut}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
