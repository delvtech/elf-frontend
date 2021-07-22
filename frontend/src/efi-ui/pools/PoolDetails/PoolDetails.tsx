import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { formatUnits } from "ethers/lib/utils";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolActionsCard } from "efi-ui/pools/PoolActionsCard/PoolActionsCard";
import { PoolCharts } from "efi-ui/pools/PoolCharts/PoolCharts";
import { PoolSummary } from "efi-ui/pools/PoolSummary/PoolSummary";
import { TermSummary } from "efi-ui/pools/TermSummary/TermSummary";
import { TokenSummary } from "efi-ui/pools/TokenSummary/TokenSummary";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { useStakingAPY } from "efi-ui/pools/hooks/useStakingAPY";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTotalValueLockedForTranche } from "efi-ui/pools/hooks/useTotalValueLockedForTranche";
import { useVolumeForPool } from "efi-ui/pools/hooks/useVolumeForPool/useVolumeForPool";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getPrincipalTokenInfoForPool } from "efi/pools/getPrincipalTokenInfoForPool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { trancheContractsByAddress } from "efi/tranche/tranches";

interface PoolDetailsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
}

export function PoolDetails(props: PoolDetailsProps): ReactElement {
  const { library, signer, account, poolInfo } = props;
  const { baseAssetInfo, termAssetInfo, baseAssetContract } =
    getPoolTokens(poolInfo);

  const totalLiquidity = useTotalFiatLiquidity(poolInfo);
  const trancheInfo = getPrincipalTokenInfoForPool(poolInfo);
  const {
    address: trancheAddress,
    decimals: trancheDecimals,
    extensions: { createdAtTimestamp, unlockTimestamp },
  } = trancheInfo;
  const trancheContract = trancheContractsByAddress[trancheAddress];
  const startTimeMs = createdAtTimestamp * 1000;
  const maturityTimeMs = unlockTimestamp * 1000;

  const totalValueLocked = useTotalValueLockedForTranche(
    trancheInfo,
    baseAssetContract
  );
  const { data: interestSupplyBN } = useSmartContractReadCall(
    trancheContract,
    "interestSupply"
  );

  const volume7d = useVolumeForPool(poolInfo, ONE_WEEK_IN_SECONDS);
  const feeVolume7d = useFeeVolumeFiatForPool(poolInfo, ONE_WEEK_IN_SECONDS);
  const stakingAPY7d = useStakingAPY(poolInfo, ONE_WEEK_IN_SECONDS);

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
          volume={volume7d}
          feeVolume={feeVolume7d}
          stakingAPY={stakingAPY7d}
          poolInfo={poolInfo}
        />
        <TermSummary
          poolInfo={poolInfo}
          totalValueLocked={totalValueLocked}
          startTimeMs={startTimeMs}
          maturityTimeMs={maturityTimeMs}
        />
        <TokenSummary
          poolInfo={poolInfo}
          interestSupply={+formatUnits(interestSupplyBN ?? 0, trancheDecimals)}
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
        <PoolCharts poolInfo={poolInfo} />
        <PoolActionsCard
          library={library}
          signer={signer}
          account={account}
          poolInfo={poolInfo}
          baseTokenInfo={baseAssetInfo}
          termTokenInfo={termAssetInfo}
        />
      </div>
    </div>
  );
}
