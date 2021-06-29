import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { formatMoney } from "efi/money/formatMoney";
import { principalPools } from "efi/pools/ccpool";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import {
  getVaultTokenInfoForTranche,
  isPrincipalToken,
} from "efi/tranche/tranches";
import { getPrincipalTokenForYieldToken } from "efi/tranche/yieldTokens";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface TermSummaryProps {
  poolInfo: PoolInfo;
  totalValueLocked: Money | undefined;
  maturityTimeMs: number | undefined;
  startTimeMs: number | undefined;
}

export function TermSummary(props: TermSummaryProps): ReactElement {
  const {
    poolInfo,
    totalValueLocked,
    maturityTimeMs = 0,
    startTimeMs = 0,
  } = props;

  const { termAssetInfo } = getPoolTokens(poolInfo);
  const { address: trancheAddress } = isPrincipalToken(termAssetInfo)
    ? termAssetInfo
    : getPrincipalTokenForYieldToken(termAssetInfo.address);

  const { symbol: vaultSymbol } = getVaultTokenInfoForTranche(trancheAddress);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);

  const { displayName, type, apy } = vaultInfo || {};
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

  const isPrincipalPool = principalPools
    .map(({ address }) => address)
    .includes(poolInfo.address);

  const startDateLabel = startTimeMs
    ? formatAbbreviatedDate(new Date(startTimeMs))
    : "";

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
            <div className={classNames("h5", tw("space-x-4"))}>
              {totalValueLocked ? formatMoney(totalValueLocked) : "$0.00"}
            </div>
          </div>

          {/* Underlying Vault */}
          {poolInfo && !isPrincipalPool ? (
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Underlying Vault`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {t`Yearn ${displayName} ${type}`}
              </div>
            </div>
          ) : null}

          {/* Underlying Vault */}
          {poolInfo && !isPrincipalPool ? (
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Vault APY`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {formatPercent(vaultApy)}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className={tw(
            "flex",
            "flex-col",
            "justify-between",
            "overflow-hidden",
            "truncate",
            "xl:ml-4"
          )}
        >
          {/* Start Date */}
          <div className={tw("flex", "flex-col", "justify-end")}>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Start Date`}
            </span>
            <div className={classNames("h5", tw("space-x-4"))}>
              {startDateLabel}
            </div>
          </div>

          {/* Status */}
          <div>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Status`}
            </span>
            <div style={{ maxWidth: "150px" }} className={tw("mt-1")}>
              <TimeLeft
                startTimestamp={startTimeMs}
                maturityTimestamp={maturityTimeMs}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
