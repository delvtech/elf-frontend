import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { formatDistanceToNow, fromUnixTime, getTime, format } from "date-fns";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useAccumulatedFiatInterestForTranche } from "efi-ui/pools/useAccumulatedFiatInterestForTranche";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface TermSummaryProps {
  pool: PoolContract | undefined;
  totalValueLocked: Money | undefined;
  interestSupply: number | undefined;
  maturityTimeMs: number | undefined;
  startTimeMs: number | undefined;
  baseAsset: ERC20 | undefined;
}

// TODO: add loading states
export function TermSummary(props: TermSummaryProps): ReactElement {
  const {
    pool,
    totalValueLocked,
    interestSupply,
    baseAsset,
    maturityTimeMs = 0,
    startTimeMs = 0,
  } = props;
  const { data: baseAssetSymbol } = useTokenSymbol(baseAsset);
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

  const now = new Date();
  const nowTimeMs = getTime(now);
  const termComplete = nowTimeMs > maturityTimeMs;
  const completeLabel = formatDistanceToNow(
    fromUnixTime(Math.round(maturityTimeMs / 1000)),
    {
      addSuffix: true,
    }
  );

  const termStatus = termComplete ? t`complete` : t`running`;

  return (
    <div>
      <div className="mb-2">{t`Term Summary`}</div>
      <Card
        style={summaryCardStyle}
        className={tw("grid", "grid-cols-2", "gap-4")}
      >
        {/* First Column*/}
        <div
          className={tw(
            "flex",
            "flex-col",
            "h-full",
            "justify-between",
            "truncate"
          )}
        >
          {/* Total Value Locked */}
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
            >{t`Total Value Locked`}</span>
            <div className={classNames("h3", tw("space-x-4"))}>
              {totalValueLocked ? formatMoney(totalValueLocked) : null}
            </div>
          </div>
        </div>

        <div
          className={tw(
            "flex",
            "flex-col",
            "h-full",
            "justify-between",
            "truncate"
          )}
        >
          {/* Start Date */}
          <div className={tw("flex", "flex-col", "justify-end")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Start Date`}
            </span>
            <div className={classNames("h3", tw("space-x-4"))}>
              {format(startTimeMs, "MMM d, y")}
            </div>
          </div>

          {/* Status */}
          <div className={tw("flex", "flex-col", "justify-end")}>
            <span
              className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
            >{t`Status`}</span>
          </div>
          <div style={{ maxWidth: "150px" }}>
            <TimeLeft startDate={startTimeMs} maturityDate={maturityTimeMs} />
          </div>
        </div>
      </Card>
    </div>
  );
}
