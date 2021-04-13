import React, { ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TrendIndicator } from "efi-ui/base/TrendIndicator/TrendIndicator";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { KNOWN_BASE_ASSETS } from "efi/contracts/contractsJson";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useTokenDeltasForPool } from "efi-ui/pools/useTokenDeltasForPool/useTokenDeltasForPool";
import { useTokenHistoricalPrice } from "efi-ui/token/hooks/useTokenHistoricalPrice";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";

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
    yieldAssetSymbol,
    yieldAssetBalance,
    yieldAssetBalanceTrend,
    yieldAssetDecimals,
    yieldAssetPrice,
    yieldAssetPriceTrend,
  } = useTokensSummary(pool);

  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Tokens`}</div>
      <div className={tw("flex", "flex-col", "space-x-4")}>
        <Card className={tw("flex", "space-x-8")}>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg", "truncate")}>
                {baseAssetSymbol}
              </span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>
                  {formatMoney(baseAssetPrice)}
                </span>
                <TrendIndicator value={baseAssetPriceTrend} />
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>
                  {Number(
                    formatUnits(baseAssetBalance || 0, baseAssetDecimals)
                  ).toFixed(2)}
                </span>
                <TrendIndicator value={baseAssetBalanceTrend} />
              </div>
            </div>
          </div>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg", "overflow-hidden", "truncate")}>
                {yieldAssetSymbol}
              </span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>
                  {formatMoney(yieldAssetPrice)}
                </span>
                <TrendIndicator value={yieldAssetPriceTrend} />
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>
                  {Number(
                    formatUnits(yieldAssetBalance || 0, yieldAssetDecimals)
                  ).toFixed(2)}
                </span>
                <TrendIndicator value={yieldAssetBalanceTrend} />
              </div>
            </div>
          </div>
        </Card>
      </div>
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
  yieldAssetContract: ERC20 | undefined;
  yieldAssetSymbol: string | undefined;
  yieldAssetBalance: BigNumber | undefined;
  yieldAssetBalanceTrend: number | undefined;
  yieldAssetDecimals: number | undefined;
  yieldAssetPrice: Money | undefined;
  yieldAssetPriceTrend: number | undefined;
}

function useTokensSummary(pool: PoolContract | undefined): TokensSummary {
  const { currency } = useCurrencyPref();
  const { data: [tokens, balances] = [undefined, undefined] } = usePoolTokens(
    pool
  );

  const baseAssetIndex: number =
    tokens?.findIndex((address) => KNOWN_BASE_ASSETS.includes(address)) ?? 0;
  const baseAssetAddress = tokens?.[baseAssetIndex];
  const baseAssetBalance = balances?.[baseAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? ERC20__factory.connect(baseAssetAddress, jsonRpcProvider)
    : undefined;
  const [baseAssetSymbol] = useTokenSymbol(baseAssetContract);
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const [baseAssetPriceYesterday] = useTokenHistoricalPrice(
    baseAssetContract,
    currency,
    1
  );

  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);

  const yieldAssetIndex = baseAssetIndex === 0 ? 1 : 0;
  const yieldAssetAddress = tokens?.[yieldAssetIndex];
  const yieldAssetBalance = balances?.[yieldAssetIndex];
  const yieldAssetContract = yieldAssetAddress
    ? ERC20__factory.connect(yieldAssetAddress, jsonRpcProvider)
    : undefined;
  const [yieldAssetSymbol] = useTokenSymbol(yieldAssetContract);
  const [yieldAssetDecimals] = useTokenDecimals(yieldAssetContract);

  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);
  const swaps = useSwaps(pool);

  const yieldAssetPrice =
    baseAssetPrice && spotPrice
      ? Money.fromDecimal(
          baseAssetPrice.toDecimal() / spotPrice,
          currency,
          Math.round
        )
      : undefined;

  const token24hrDeltas = useTokenDeltasForPool(pool);
  const baseAssetDelta = token24hrDeltas?.[baseAssetIndex];
  const yieldAssetDelta = token24hrDeltas?.[yieldAssetIndex];

  let baseAssetPriceTrend;
  if (baseAssetPrice && baseAssetPriceYesterday) {
    baseAssetPriceTrend =
      (baseAssetPrice.toDecimal() - baseAssetPriceYesterday.toDecimal()) /
      baseAssetPriceYesterday.toDecimal();
  }

  let yieldAssetPriceTrend;
  if (swaps?.length && spotPrice && baseAssetPriceYesterday && baseAssetPrice) {
    const swapOneDayAgo = swaps[0];
    const [, tokenIn, , amountIn, amountOut] = swapOneDayAgo;
    const baseAmount = tokenIn === baseAssetAddress ? amountIn : amountOut;
    const yieldAmount = tokenIn === yieldAssetAddress ? amountIn : amountOut;
    const oldSpotPrice = Math.abs(
      +formatUnits(yieldAmount, baseAssetDecimals) /
        +formatUnits(baseAmount, baseAssetDecimals)
    );
    // this calculation is pretty iffy.  baseAssetPriceYesterday probably does not line up with
    // oldSpotPrice very well.
    // TOOD: find better historical data for ETH and other base assets.
    const oldYieldPrice = oldSpotPrice * baseAssetPriceYesterday.toDecimal();
    const newYieldPrice = spotPrice * baseAssetPrice.toDecimal();
    yieldAssetPriceTrend = (newYieldPrice - oldYieldPrice) / oldYieldPrice;
  }

  let baseAssetBalanceTrend;
  let yieldAssetBalanceTrend;
  if (
    baseAssetDelta &&
    yieldAssetDelta &&
    baseAssetBalance &&
    yieldAssetBalance &&
    baseAssetDecimals
  ) {
    const baseAssetBalanceValue = +formatUnits(
      baseAssetBalance,
      baseAssetDecimals
    );
    const baseAssetDeltaValue = +formatUnits(baseAssetDelta, baseAssetDecimals);
    const yieldAssetBalanceValue = +formatUnits(
      yieldAssetBalance,
      baseAssetDecimals
    );
    const yieldAssetDeltaValue = +formatUnits(
      yieldAssetDelta,
      baseAssetDecimals
    );

    baseAssetBalanceTrend =
      1 - (baseAssetBalanceValue + baseAssetDeltaValue) / baseAssetBalanceValue;
    yieldAssetBalanceTrend =
      1 -
      (yieldAssetBalanceValue + yieldAssetDeltaValue) / yieldAssetBalanceValue;
  }

  return {
    baseAssetContract,
    baseAssetSymbol,
    baseAssetBalance,
    baseAssetBalanceTrend,
    baseAssetDecimals,
    baseAssetPrice,
    baseAssetPriceTrend,
    yieldAssetContract,
    yieldAssetSymbol,
    yieldAssetBalance,
    yieldAssetBalanceTrend,
    yieldAssetDecimals,
    yieldAssetPrice,
    yieldAssetPriceTrend,
  };
}
