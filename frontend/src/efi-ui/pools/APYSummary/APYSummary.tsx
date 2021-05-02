import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useAccumulatedFiatInterestForTranche } from "efi-ui/pools/useAccumulatedFiatInterestForTranche";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_DAY_IN_SECONDS, ONE_YEAR_IN_SECONDS } from "efi/base/time";
import { formatMoney } from "efi/money/formatMoney";
import { isWeightedPool, PoolContract } from "efi/pools/PoolContract";
import { TermAssetType } from "efi/tranche/TermAssetType";

interface APYSummaryProps {
  pool: PoolContract | undefined;
  maturityDate: number | undefined;
  startDate: number | undefined;
  baseAsset: ERC20 | undefined;
}

// TODO: add loading states
export function APYSummary(props: APYSummaryProps): ReactElement {
  const { pool } = props;
  const termAssetType: TermAssetType = isWeightedPool(pool)
    ? "yield"
    : "principal";

  const tokenYieldLabel =
    termAssetType === "principal"
      ? t`Principal Fixed Yield`
      : t`Token Variable Yield`;

  const baseAssetContract = useBaseAssetForPool(pool);

  const stakingAPY = useStakingAPY(pool);

  const tokenYield = useTokenYield(baseAssetContract, pool, termAssetType);

  const accumulatedInterest = useAccumulatedFiatInterestForTranche(
    baseAssetContract,
    pool
  );

  return (
    <div className={tw("flex-1")}>
      {/* <div className="mb-2">{t`APY Summary`}</div> */}
      {/* <Card> */}
      <div className={tw("grid", "grid-cols-3")}>
        {/* Staking APY */}
        <div className={tw("flex", "space-x-4", "justify-center")}>
          <div className={tw("flex", "flex-col")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Pool Staking Yield`}
            </span>
            <div className={classNames("h1", tw("space-x-4"))}>
              {formatPercent(stakingAPY)}
            </div>
          </div>
        </div>
        {/* Token APY */}
        <div className={tw("flex", "space-x-4", "justify-center")}>
          <div className={tw("flex", "flex-col")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {tokenYieldLabel}
            </span>
            <div className={classNames("h1", tw("space-x-4"))}>
              {formatPercent(tokenYield)}
            </div>
          </div>
        </div>
        {/*Interest*/}
        <div className={tw("flex", "space-x-4", "justify-center")}>
          <div className={tw("flex", "flex-col")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Accumulated Interest`}
            </span>
            <div className={tw("flex", "space-x-4")}>
              <div className={classNames("h1", tw("space-x-4"))}>
                {formatMoney(accumulatedInterest)}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* </Card> */}
    </div>
  );
}
function useStakingAPY(pool: PoolContract | undefined) {
  const totalLiquidity = useTotalFiatLiquidityForPool(pool);
  const feeVolume24hr = useFeeVolumeFiatForPool(pool);

  const liquidity = totalLiquidity?.toDecimal();
  const fees = feeVolume24hr.toDecimal();
  let stakingAPY = 0;
  if (liquidity && fees) {
    const stakingYield24hr = fees / liquidity;
    stakingAPY = (stakingYield24hr * ONE_YEAR_IN_SECONDS) / ONE_DAY_IN_SECONDS;
  }
  return stakingAPY;
}

function useTokenYield(
  baseAssetContract: ERC20 | undefined,
  pool: PoolContract | undefined,
  termAssetType: string
) {
  // get fixed yield
  const baseAssetSymbol = useTokenSymbol(baseAssetContract);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const trancheContract = useTrancheForPool(pool);

  const { data: unlockTimestampBN } = useSmartContractReadCall(
    trancheContract,
    "unlockTimestamp"
  );
  let fixedAPY = 0;
  if (spotPrice && unlockTimestampBN) {
    const timeLeftInSeconds =
      unlockTimestampBN.toNumber() - Math.round(Date.now() / 1000);

    // spot price is how much principal tokens for 1 base token.  but we want how much base tokens for 1 principal
    // tokens so we take the inverse.  i.e. 0.9 ETH for 1 principal token.
    // base token.
    const principalPrice = 1 / spotPrice;

    // principalPrice is the price in terms of the base asset.  Since we know the principal will be
    // equal to base at term, (1 - principalPrice) gives us the the fixed interest for the rest of
    // the term.  so we take that number and scale up to a year for APY:
    //
    // fixed apy = fixed interest * one_year / term_length

    fixedAPY = ((1 - principalPrice) * ONE_YEAR_IN_SECONDS) / timeLeftInSeconds;
  }

  // the yield token apy is the same as the underlying vault, so we pull from there.
  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );

  const variableAPY = vaultInfo?.apy?.recommended ?? 0;

  const tokenYield = termAssetType === "principal" ? fixedAPY : variableAPY;
  return tokenYield;
}
