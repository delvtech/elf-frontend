import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { formatPercent } from "efi/base/formatPercent";
import { isWeightedPool, PoolContract } from "efi/pools/PoolContract";
import { TermAssetType } from "efi/tranche/TermAssetType";

interface APYSummaryProps {
  pool: PoolContract | undefined;
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
      </div>
      {/* </Card> */}
    </div>
  );
}
