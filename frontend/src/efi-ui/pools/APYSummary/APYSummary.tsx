import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useParseSortedTokensForPool } from "efi-ui/pools/useParsedTokensForPool/useParsedTokensForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { ONE_YEAR_IN_SECONDS } from "efi/base/time";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";
import { TermAssetType } from "efi/tranche/TermAssetType";
import { formatPercent } from "efi/base/formatPercent";

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

  const { baseAssetContract, termAssetContract } = useParseSortedTokensForPool(
    pool
  );

  const tokenYield = useTokenYield(
    baseAssetContract,
    pool,
    termAssetContract,
    termAssetType
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
            <div className={classNames("h1", tw("space-x-4"))}>0%</div>
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
              <div className={classNames("h1", tw("space-x-4"))}>$1000</div>
              <div className={classNames("h1", tw("space-x-4"))}>(10%)</div>
            </div>
          </div>
        </div>
      </div>
      {/* </Card> */}
    </div>
  );
}
function useTokenYield(
  baseAssetContract: ERC20 | undefined,
  pool: PoolContract | undefined,
  termAssetContract: ERC20 | undefined,
  termAssetType: string
) {
  // get fixed yield
  const baseAssetSymbol = useTokenSymbol(baseAssetContract);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const trancheContract = isConvergentCurvePool(pool)
    ? (termAssetContract as Tranche)
    : undefined;
  const { data: unlockTimestampBN } = useSmartContractReadCall(
    trancheContract,
    "unlockTimestamp"
  );
  let fixedAPY = 0;
  if (spotPrice && unlockTimestampBN) {
    const timeLeftInSeconds =
      unlockTimestampBN.toNumber() - Math.round(Date.now() / 1000);

    // spotPrice is principal price / base price, so we should get numbers like 0.9.  since we know
    // the principal will be equal to base at term, 1 - spotPrice gives us the the fixed interest for the
    // rest of the term.  so we take that number and scale it down to a year for APY:
    //
    // fixed apy = fixed interest * one_year / term_length

    fixedAPY = ((1 - spotPrice) * timeLeftInSeconds) / ONE_YEAR_IN_SECONDS;
  }

  // the yield token apy is the same as the underlying vault, so we pull from there.
  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );

  const variableAPY = vaultInfo?.apy?.recommended ?? 0;

  const tokenYield = termAssetType === "principal" ? fixedAPY : variableAPY;
  return tokenYield;
}
