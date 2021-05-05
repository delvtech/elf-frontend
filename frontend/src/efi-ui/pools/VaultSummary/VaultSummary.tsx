import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useAccumulatedFiatInterestForTranche } from "efi-ui/pools/useAccumulatedFiatInterestForTranche";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { Money } from "ts-money";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface VaultSummaryProps {
  pool: PoolContract | undefined;
  totalValueLocked: Money | undefined;
  interestSupply: number | undefined;
  maturityDate: number | undefined;
  startDate: number | undefined;
  baseAsset: ERC20 | undefined;
}

// TODO: add loading states
export function VaultSummary(props: VaultSummaryProps): ReactElement {
  const {
    pool,
    totalValueLocked,
    interestSupply,
    baseAsset,
    maturityDate = 0,
    startDate = 0,
  } = props;
  // hardcode for now, will make this dynamic after updating testnet
  const { data: baseAssetSymbol } = useTokenSymbol(baseAsset);
  console.log("baseAssetSymbol", baseAssetSymbol);
  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );
  const { name } = vaultInfo || {};

  const accumulatedInterest = useAccumulatedFiatInterestForTranche(
    baseAsset,
    pool
  );
  const interestPerToken = interestSupply
    ? accumulatedInterest?.divide(interestSupply, Math.round)
    : undefined;

  return (
    <div>
      <div className="mb-2">{t`Term Summary`}</div>
      <Card
        style={summaryCardStyle}
        className={tw("flex", "flex-col", "space-y-6")}
      >
        {/* Vault Name */}
        <div className={tw("flex", "space-x-4", "justify-between", "relative")}>
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
            >{t`Total Value Locked`}</span>
            <div className={classNames("h3", tw("space-x-4"))}>
              {totalValueLocked ? formatMoney(totalValueLocked) : null}
            </div>
          </div>
          <div className={tw("absolute", "top-0", "right-0")}>
            <div className={tw("flex", "justify-between")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Status`}</span>
              <Tag intent={Intent.PRIMARY}>running</Tag>
            </div>
            <TimeLeft startDate={startDate} maturityDate={maturityDate} />
          </div>
        </div>

        {/*Interest*/}
        <div className={tw("flex", "space-x-4", "justify-between")}>
          <div className={tw("flex", "flex-col")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Accumulated Interest`}
            </span>
            <div className={tw("flex", "space-x-4")}>
              <div className={classNames("h3", tw("space-x-4"))}>
                {formatMoney(accumulatedInterest)}
              </div>
            </div>
          </div>
        </div>

        {/* Vault ROI */}
        <div className={tw("flex", "space-x-4", "justify-between")}>
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
            >{t`(Acc. Interest Per token)`}</span>
            <div className={classNames("h3", tw("space-x-4"))}>
              {formatMoney(interestPerToken)}
            </div>
          </div>
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
            >{t`Underlying Strategy`}</span>
            <div className={classNames("h3", tw("space-x-4"))}>{name}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
