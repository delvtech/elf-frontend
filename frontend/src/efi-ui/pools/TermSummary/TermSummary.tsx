import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { format } from "date-fns";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { formatMoney } from "efi/money/formatMoney";
import { isConvergentCurvePool, PoolContract } from "efi/pools/PoolContract";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface TermSummaryProps {
  pool: PoolContract | undefined;
  totalValueLocked: Money | undefined;
  maturityTimeMs: number | undefined;
  startTimeMs: number | undefined;
  baseAssetContract: ERC20 | undefined;
}

// TODO: add loading states
export function TermSummary(props: TermSummaryProps): ReactElement {
  const {
    pool,
    totalValueLocked,
    baseAssetContract,
    maturityTimeMs = 0,
    startTimeMs = 0,
  } = props;
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);

  const { displayName, type, apy } = vaultInfo || {};
  const vaultApy = apy?.recommended ?? 0;

  const isPrincipalPool = isConvergentCurvePool(pool);

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
          {pool && !isPrincipalPool ? (
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
          {pool && !isPrincipalPool ? (
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
              {startTimeMs ? format(startTimeMs, "MMM d, y") : ""}
            </div>
          </div>

          {/* Status */}
          <div>
            <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
              {t`Status`}
            </span>
            <div style={{ maxWidth: "150px" }} className={tw("mt-1")}>
              <TimeLeft startDate={startTimeMs} maturityDate={maturityTimeMs} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
