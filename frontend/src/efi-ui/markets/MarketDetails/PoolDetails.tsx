import React, { FC } from "react";

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
import { formatEth } from "efi/coins/ether/formatEth";
import { PoolContract } from "efi/pools/PoolContract";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

interface PoolDetailsProps {
  signer: Signer | undefined;
  account: string | null | undefined;
  pool: PoolContract | undefined;
}

export const PoolDetails: FC<PoolDetailsProps> = ({
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
  const totalSupplyResult = useSmartContractReadCall(pool, "totalSupply");
  const totalSupply = formatEth(getQueryData(totalSupplyResult), 0);

  return (
    <div className={tw("flex", "mb-8", "space-x-4", "w-full", "items-stretch")}>
      <div className={tw("flex", "flex-1")}>
        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          <div className={tw("flex", "space-x-12")}>
            <MarketSummary totalSupply={totalSupply} />
            <FixedYieldSummary startDate={0} maturityDate={0} />
            <TokenSummary tokenIn={tokenIn} tokenOut={tokenOut} />
          </div>
          <div className={tw("flex", "space-x-12")}>
            <MarketHistory />
            <PoolActionsCard
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
