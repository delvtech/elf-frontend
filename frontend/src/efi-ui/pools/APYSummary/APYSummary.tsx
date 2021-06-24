import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { formatPercent } from "efi/base/formatPercent";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { TermAssetType } from "efi/tranche/TermAssetType";

interface APYSummaryProps {
  poolInfo: PoolInfo;
}

export function APYSummary(props: APYSummaryProps): ReactElement {
  const { poolInfo } = props;
  const termAssetType: TermAssetType = isYieldPool(poolInfo)
    ? "yield"
    : "principal";

  const tokenYieldLabel =
    termAssetType === "principal"
      ? t`Principal Fixed Yield`
      : t`Token Variable Yield`;

  const stakingAPY = useStakingAPY(poolInfo);

  const tokenYield = useTokenYield(poolInfo, termAssetType);

  return (
    <div className={tw("flex-1")}>
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
    </div>
  );
}
