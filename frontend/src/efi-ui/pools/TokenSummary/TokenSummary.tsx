import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TrendIndicator } from "efi-ui/base/TrendIndicator/TrendIndicator";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useTokenDeltasForPool } from "efi-ui/pools/useTokenDeltasForPool/useTokenDeltasForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenHistoricalPrice } from "efi-ui/token/hooks/useTokenHistoricalPrice";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface TokenSummaryProps {
  pool: PoolContract | undefined;
}

export function TokenSummary({ pool }: TokenSummaryProps): ReactElement {
  const {
    baseAssetSymbol,
    baseAssetBalance,
    baseAssetBalanceTrend,
    baseAssetDecimals,
    baseAssetPrice,
    baseAssetPriceTrend,
    termAssetSymbol,
    termAssetBalance,
    termAssetBalanceTrend,
    termAssetDecimals,
    termAssetPrice,
    termAssetPriceTrend,
  } = useTokensSummary(pool);

  return (
    <div>
      <div className="mb-2">{t`Token Summary`}</div>
      <Card style={summaryCardStyle} className={tw("flex", "space-x-8")}>
        <TokenInfo
          assetSymbol={baseAssetSymbol}
          assetPrice={baseAssetPrice}
          assetPriceTrend={baseAssetPriceTrend}
          assetBalance={baseAssetBalance}
          assetDecimals={baseAssetDecimals}
          assetBalanceTrend={baseAssetBalanceTrend}
        />
        <TokenInfo
          assetSymbol={termAssetSymbol}
          assetPrice={termAssetPrice}
          assetPriceTrend={termAssetPriceTrend}
          assetBalance={termAssetBalance}
          assetDecimals={termAssetDecimals}
          assetBalanceTrend={termAssetBalanceTrend}
        />
      </Card>
    </div>
  );
}

interface TokensSummary {
  baseAssetContract: ERC20 | undefined;
  baseAssetSymbol: string | undefined;
  baseAssetBalance: BigNumber | undefined;
  baseAssetBalanceTrend: number | undefined;
  baseAssetDecimals: number | undefined;
  baseAssetPrice: Money | undefined;
  baseAssetPriceTrend: number | undefined;
  termAssetContract: ERC20 | undefined;
  termAssetSymbol: string | undefined;
  termAssetBalance: BigNumber | undefined;
  termAssetBalanceTrend: number | undefined;
  termAssetDecimals: number | undefined;
  termAssetPrice: Money | undefined;
  termAssetPriceTrend: number | undefined;
}

interface TokenInfoProps {
  assetSymbol: string | undefined;
  assetPrice: Money | undefined;
  assetPriceTrend: number | undefined;
  assetBalance: BigNumber | undefined;
  assetDecimals: number | undefined;
  assetBalanceTrend: number | undefined;
}
function TokenInfo({
  assetSymbol,
  assetPrice,
  assetPriceTrend,
  assetBalance,
  assetDecimals,
  assetBalanceTrend,
}: TokenInfoProps): ReactElement {
  return (
    <div className={tw("space-y-6", "flex-1", "overflow-hidden")}>
      <div
        className={tw(
          "flex",
          "flex-col",
          "justify-center",
          "space-y-1",
          "overflow-hidden"
        )}
      >
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {t`Token`}
        </span>
        <span className={tw("text-lg", "truncate")}>{assetSymbol}</span>
      </div>
      <div className={tw("flex", "flex-col", "justify-center", "space-y-1")}>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {t`Price`}
        </span>
        <div className={tw("flex", "justify-between")}>
          <span className={tw("text-lg")}>{formatMoney(assetPrice)}</span>
          <TrendIndicator value={assetPriceTrend} />
        </div>
      </div>
      <div className={tw("flex", "flex-col", "justify-center", "space-y-1")}>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {t`Quantity`}
        </span>
        <div className={tw("flex", "justify-between")}>
          <span className={tw("text-lg")}>
            {Number(formatUnits(assetBalance || 0, assetDecimals)).toFixed(2)}
          </span>
          <TrendIndicator value={assetBalanceTrend} />
        </div>
      </div>
    </div>
  );
}

function useTokensSummary(pool: PoolContract | undefined): TokensSummary {
  const { currency } = useCurrencyPref();
  const { data: [tokens, balances] = [undefined, undefined] } = usePoolTokens(
    pool
  );

  const {
    baseAssetIndex,
    termAssetIndex,
    baseAssetContract,
    termAssetContract,
  } = parseSortedTokensForPool(tokens);
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);

  // Base Asset Info
  const baseAssetBalance = balances?.[baseAssetIndex];
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const [baseAssetPriceYesterday] = useTokenHistoricalPrice(
    baseAssetContract,
    currency,
    1
  );
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);

  // Term Asset Info
  const termAssetBalance = balances?.[termAssetIndex];
  const { label: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const { data: termAssetDecimals } = useTokenDecimals(termAssetContract);

  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const swaps = useSwaps(pool);

  const termAssetPrice =
    baseAssetPrice && spotPrice
      ? Money.fromDecimal(
          baseAssetPrice.toDecimal() / spotPrice,
          currency,
          Math.round
        )
      : undefined;

  const token24hrDeltas = useTokenDeltasForPool(pool);
  const baseAssetDelta = token24hrDeltas?.[baseAssetIndex];
  const termAssetDelta = token24hrDeltas?.[termAssetIndex];

  let baseAssetPriceTrend;
  if (baseAssetPrice && baseAssetPriceYesterday) {
    baseAssetPriceTrend =
      (baseAssetPrice.toDecimal() - baseAssetPriceYesterday.toDecimal()) /
      baseAssetPriceYesterday.toDecimal();
  }

  let termAssetPriceTrend;
  if (swaps?.length && spotPrice && baseAssetPriceYesterday && baseAssetPrice) {
    const swapOneDayAgo = swaps[0];
    const [, tokenIn, , amountIn, amountOut] = swapOneDayAgo;
    const baseAmount =
      tokenIn === baseAssetContract?.address ? amountIn : amountOut;
    const termAmount =
      tokenIn === termAssetContract?.address ? amountIn : amountOut;
    const oldSpotPrice = Math.abs(
      +formatUnits(termAmount, baseAssetDecimals) /
        +formatUnits(baseAmount, baseAssetDecimals)
    );
    // this calculation is pretty iffy.  baseAssetPriceYesterday probably does not line up with
    // oldSpotPrice very well.
    // TOOD: find better historical data for ETH and other base assets.
    const oldTermAssetPrice =
      oldSpotPrice * baseAssetPriceYesterday.toDecimal();
    const newTermAssetPrice = spotPrice * baseAssetPrice.toDecimal();
    termAssetPriceTrend =
      (newTermAssetPrice - oldTermAssetPrice) / oldTermAssetPrice;
  }

  let baseAssetBalanceTrend;
  let termAssetBalanceTrend;
  if (
    baseAssetDelta &&
    termAssetDelta &&
    baseAssetBalance &&
    termAssetBalance &&
    baseAssetDecimals
  ) {
    const baseAssetBalanceValue = +formatUnits(
      baseAssetBalance,
      baseAssetDecimals
    );
    const baseAssetDeltaValue = +formatUnits(baseAssetDelta, baseAssetDecimals);
    const termAssetBalanceValue = +formatUnits(
      termAssetBalance,
      baseAssetDecimals
    );
    const termAssetDeltaValue = +formatUnits(termAssetDelta, baseAssetDecimals);

    baseAssetBalanceTrend =
      1 - (baseAssetBalanceValue + baseAssetDeltaValue) / baseAssetBalanceValue;
    termAssetBalanceTrend =
      1 - (termAssetBalanceValue + termAssetDeltaValue) / termAssetBalanceValue;
  }

  return {
    baseAssetContract,
    baseAssetSymbol,
    baseAssetBalance,
    baseAssetBalanceTrend,
    baseAssetDecimals,
    baseAssetPrice,
    baseAssetPriceTrend,
    termAssetContract,
    termAssetSymbol,
    termAssetBalance,
    termAssetBalanceTrend,
    termAssetDecimals,
    termAssetPrice,
    termAssetPriceTrend,
  };
}
