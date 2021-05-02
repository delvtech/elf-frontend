import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
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
            <div className={classNames("h1", tw("space-x-4"))}>10%</div>
          </div>
        </div>
        {/* Token APY */}
        <div className={tw("flex", "space-x-4", "justify-center")}>
          <div className={tw("flex", "flex-col")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {tokenYieldLabel}
            </span>
            <div className={classNames("h1", tw("space-x-4"))}>10%</div>
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
