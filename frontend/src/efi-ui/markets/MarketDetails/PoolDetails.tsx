import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { FixedYieldSummary } from "efi-ui/markets/FixedYieldSummary/FixedYieldSummary";
import { PoolActionsCard } from "efi-ui/markets/MarketActionsCard/PoolActionsCard";
import { MarketHistory } from "efi-ui/markets/MarketHistory/MarketHistory";
import { MarketSummary } from "efi-ui/markets/MarketSummary/MarketSummary";
import { TokenSummary } from "efi-ui/markets/TokenSummary/TokenSummary";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSwapFee } from "efi-ui/pools/useSwapFee/useSwapFee";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useVolume } from "efi-ui/pools/useVolume/useVolume";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
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
  const tranche = useTrancheForPool(pool);
  const { data: startDateInUnixSeconds } = useTrancheCreatedAt(tranche);
  const { data: maturityDateInUnixSeconds } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const startDate = (startDateInUnixSeconds || 0) * 1000;
  const maturityDate = (maturityDateInUnixSeconds?.toNumber() || 0) * 1000;

  const volume = useVolume(pool);
  const swapFee = useSwapFee(pool);
  const swapFeeDecimal = +formatEther(swapFee || 0);
  const swapVolume = volume?.multiply(swapFeeDecimal);

  return (
    <div className={tw("flex", "mb-8", "space-x-4", "w-full", "items-stretch")}>
      <div className={tw("flex", "flex-1")}>
        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          <div className={tw("flex", "space-x-12")}>
            <MarketSummary
              tradeVolume={volume}
              swapVolume={swapVolume}
              totalLiquidity={totalLiquidity}
            />
            <FixedYieldSummary
              startDate={startDate}
              maturityDate={maturityDate}
            />
            <TokenSummary pool={pool} tokenIn={tokenIn} tokenOut={tokenOut} />
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
