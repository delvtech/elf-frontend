import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Signer } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolActionsCard } from "efi-ui/pools/PoolActionsCard/PoolActionsCard";
import { PoolCharts } from "efi-ui/pools/PoolCharts/PoolCharts";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { TermSummary } from "efi-ui/pools/TermSummary/TermSummary";
import { TokenSummary } from "efi-ui/pools/TokenSummary/TokenSummary";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/useTotalValueLockedForTranche";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { getSmartContractFromRegistryStatic } from "efi/contracts/SmartContractsRegistry";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTokenInfo } from "efi/tokenlists";

interface PoolDetailsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  walletActive: boolean;
  pool: PoolContract | undefined;
  poolInfo: PoolInfo;
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
    poolInfo,
  } = props;
  const { baseAssetInfo, termAssetInfo, baseAssetContract, termAssetContract } =
    getPoolTokens(poolInfo);

  const totalLiquidity = useTotalFiatLiquidityForPool(pool);
  const trancheInfo = getTrancheForPool(poolInfo);

  const trancheContract = getSmartContractFromRegistryStatic(
    trancheInfo.address,
    Tranche__factory
  );

  const tokenInfo = getTokenInfo(trancheContract?.address ?? "");
  const decimals = tokenInfo?.decimals;

  const totalValueLocked = useTotalValueLockedForTranche(
    trancheInfo,
    baseAssetContract
  );
  const { data: interestSupplyBN } = useSmartContractReadCall(
    trancheContract,
    "interestSupply"
  );
  const startDateInUnixSeconds = trancheInfo.extensions.createdAtTimestamp;
  const maturityDateInUnixSeconds = trancheInfo.extensions.unlockTimestamp;

  const startTimeMs = startDateInUnixSeconds * 1000;
  const maturityTimeMs = maturityDateInUnixSeconds * 1000;

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
          firstTokenInfo={baseAssetInfo}
          secondTokenInfo={termAssetInfo}
        />
      </div>
    </div>
  );
}
