import React, { ReactElement, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import tw from "efi-tailwindcss-classnames";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolActionsCard } from "efi-ui/pools/PoolActionsCard/PoolActionsCard";
import { PoolCharts } from "efi-ui/pools/PoolCharts/PoolCharts";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { TermSummary } from "efi-ui/pools/TermSummary/TermSummary";
import { TokenSummary } from "efi-ui/pools/TokenSummary/TokenSummary";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { getTokenInfo } from "efi/tokenlists";

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
  const { library, signer, account, chainId, connector, walletActive, pool } =
    props;
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];

  const { baseAssetContract, termAssetContract } =
    parseSortedTokensForPool(tokenAddresses);

  const totalLiquidityResult = useTotalFiatLiquidityForPool(pool);
  const totalLiquidityNumber = totalLiquidityResult?.toDecimal();
  const totalLiquidity = useMemo(
    () => totalLiquidityResult,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalLiquidityNumber]
  );

  const tranche = useTrancheForPool(pool);

  const tokenInfo = getTokenInfo(tranche?.address ?? "");
  const decimals = tokenInfo?.decimals;

  const totalValueLocked = useTotalValueLockedForTranche(
    tranche,
    baseAssetContract
  );
  const { data: interestSupplyBN } = useSmartContractReadCall(
    tranche,
    "interestSupply"
  );
  const startDateInUnixSeconds = useTrancheCreatedAt(tranche);
  const { data: maturityDateInUnixSeconds } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const startTimeMs = (startDateInUnixSeconds || 0) * 1000;
  const maturityTimeMs = (maturityDateInUnixSeconds?.toNumber() || 0) * 1000;

  const volume24hr = useVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  const feeVolume24hr = useFeeVolumeFiatForPool(pool, ONE_DAY_IN_SECONDS);

  const stakingAPY = useStakingAPY(pool);

  return (
    <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-8",
          "xl:space-y-0",
          "xl:grid",
          "xl:grid-flow-row",
          "xl:gap-12",
          "xl:grid-cols-3",
          "xl:auto-rows-max"
        )}
      >
        <PoolSummary
          liquidity={totalLiquidity}
          volume={volume24hr}
          feeVolume={feeVolume24hr}
          stakingAPY={stakingAPY}
          pool={pool}
        />
        <TermSummary
          pool={pool}
          totalValueLocked={totalValueLocked}
          baseAssetContract={baseAssetContract}
          startTimeMs={startTimeMs}
          maturityTimeMs={maturityTimeMs}
        />
        <TokenSummary
          pool={pool}
          interestSupply={+formatUnits(interestSupplyBN ?? 0, decimals)}
        />
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-8",
          "xl:space-y-0",
          "xl:grid",
          "xl:grid-flow-row",
          "xl:gap-12",
          "xl:grid-cols-2",
          "xl:auto-rows-max"
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
