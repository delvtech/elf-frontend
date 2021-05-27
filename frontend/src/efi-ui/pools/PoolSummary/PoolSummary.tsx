import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { commify, formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { formatPercent } from "efi/base/formatPercent";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { formatMoney } from "efi/money/formatMoney";
import { useParseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { isConvergentCurvePool, PoolContract } from "efi/pools/PoolContract";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface PoolSummaryProps {
  liquidity: Money | undefined;
  liquidityTrend?: number | undefined;
  volume: number | undefined;
  volumeTrend?: number | undefined;
  feeVolume: Money | undefined;
  feeVolumeTrend?: number | undefined;
  stakingAPY: number | undefined;
  pool: PoolContract | undefined;
}

export function PoolSummary(props: PoolSummaryProps): ReactElement {
  const { liquidity, volume, feeVolume, stakingAPY, pool } = props;

  const { data: [tokens, balances] = [undefined, undefined] } =
    usePoolTokens(pool);

  const {
    baseAssetIndex,
    termAssetIndex,
    baseAssetContract,
    termAssetContract,
  } = useParseSortedTokensForPool(tokens);

  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const baseAssetBalance = balances?.[baseAssetIndex];
  const termAssetBalance = balances?.[termAssetIndex];

  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const { data: termAssetDecimals } = useTokenDecimals(termAssetContract);

  const quantityLabel = isConvergentCurvePool(pool) ? "PT" : "YT";

  const { currency } = useCurrencyPref();
  const volumeMoney = Money.fromDecimal(volume ?? 0, currency, Math.round);
  const volumeDisplayValue = volume ? formatMoney(volumeMoney) : "$0.00";
  return (
    <div>
      <div className="mb-2">{t`Pool Summary`}</div>
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
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Total Liquidity`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {liquidity ? formatMoney(liquidity) : "$0.00"}
              </div>
            </div>
          </div>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Volume (24hr)`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {volumeDisplayValue}
              </div>
            </div>
          </div>
          {/* Quantity Base (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Quantity ${baseAssetSymbol}`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {baseAssetBalance
                  ? commify(
                      Number(
                        formatUnits(baseAssetBalance || 0, baseAssetDecimals)
                      ).toFixed()
                    )
                  : "0.00"}
              </div>
            </div>
          </div>
        </div>
        {/* Second column */}
        <div
          className={tw(
            "flex",
            "flex-col",
            "h-full",
            "justify-between",
            "overflow-hidden"
          )}
        >
          {/* Staking APY (24hr) */}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Staking APY (24h)`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {formatPercent(stakingAPY || 0)}
              </div>
            </div>
          </div>
          {/* Fees (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Fees (24hr)`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {feeVolume ? formatMoney(feeVolume) : "$0.00"}
              </div>
            </div>
          </div>
          {/* Quantity Term (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Quantity (${quantityLabel})`}</span>
              <div className={classNames("h5", tw("space-x-4"))}>
                {termAssetBalance
                  ? commify(
                      Number(
                        formatUnits(termAssetBalance || 0, termAssetDecimals)
                      ).toFixed()
                    )
                  : "0.00"}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
