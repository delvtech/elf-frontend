import React, { CSSProperties, ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSwaps } from "efi-ui/pools/useSwaps/useSwaps";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenHistoricalPrice } from "efi-ui/token/hooks/useTokenHistoricalPrice";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { formatPercent } from "efi/base/formatPercent";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { PoolContract } from "efi/pools/PoolContract";
import { isConvergentCurvePool } from "efi/pools/PoolContract";
import { useAccumulatedInterestForTranche } from "efi-ui/pools/useAccumulatedInterestForTranche";
import { useAccumulatedFiatInterestForTranche } from "efi-ui/pools/useAccumulatedFiatInterestForTranche";

const summaryCardStyle: CSSProperties = {
  height: 220,
};

interface TokenSummaryProps {
  pool: PoolContract | undefined;
  interestSupply: number | undefined;
}

export function TokenSummary({
  pool,
  interestSupply,
}: TokenSummaryProps): ReactElement {
  const {
    baseAssetSymbol,
    termAssetSymbol,
    termAssetBalance,
    termAssetBalanceTrend,
    termAssetDecimals,
    termAssetPrice,
    termAssetPriceTrend,
    fixedYield,
    fiatInterestPerToken,
    interestPerToken,
  } = useTokensSummary(pool, interestSupply || 0);

  const isPrincipalPool = isConvergentCurvePool(pool);

  return (
    <div>
      <div className="mb-2">{t`Token Summary`}</div>
      <Card style={summaryCardStyle} className={tw("flex", "space-x-8")}>
        <TokenInfo
          baseAssetSymbol={baseAssetSymbol}
          assetSymbol={termAssetSymbol}
          assetPrice={termAssetPrice}
          assetPriceTrend={termAssetPriceTrend}
          assetBalance={termAssetBalance}
          assetDecimals={termAssetDecimals}
          assetBalanceTrend={termAssetBalanceTrend}
        />
        <div
          className={tw("space-y-6", "flex-1", "overflow-hidden", "xl:ml-4")}
        >
          {isPrincipalPool ? (
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
                {t`Fixed Rate APY`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={classNames("h5", tw("space-x-4"))}>
                  {formatPercent(fixedYield || 0)}
                </span>
              </div>
            </div>
          ) : null}
          {!isPrincipalPool ? (
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
                {t`Acc. Interest`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={classNames("h5", tw("space-x-4"))}>
                  {interestPerToken ? +interestPerToken : 0}{" "}
                  {t` ${baseAssetSymbol}`}
                </span>
              </div>
            </div>
          ) : null}
          {!isPrincipalPool ? (
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
                {t`Acc. Interest (USD)`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={classNames("h5", tw("space-x-4"))}>
                  {fiatInterestPerToken ? formatMoney(fiatInterestPerToken) : 0}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

interface TokensSummary {
  baseAssetSymbol: string | undefined;
  termAssetContract: ERC20 | undefined;
  termAssetSymbol: string | undefined;
  termAssetBalance: BigNumber | undefined;
  termAssetBalanceTrend: number | undefined;
  termAssetDecimals: number | undefined;
  termAssetPrice: Money | undefined;
  termAssetPriceTrend: number | undefined;
  fixedYield: number | undefined;
  fiatInterestPerToken: Money | undefined;
  interestPerToken: number | undefined;
}

interface TokenInfoProps {
  baseAssetSymbol: string | undefined;
  assetSymbol: string | undefined;
  assetPrice: Money | undefined;
  assetPriceTrend: number | undefined;
  assetBalance: BigNumber | undefined;
  assetDecimals: number | undefined;
  assetBalanceTrend: number | undefined;
}
function TokenInfo({
  baseAssetSymbol,
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
        <span className={classNames("h5", tw("space-x-4", "truncate"))}>
          {assetSymbol}
        </span>
      </div>
      <div className={tw("flex", "flex-col", "justify-center", "space-y-1")}>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {t`Price`}
        </span>
        <div className={tw("flex", "justify-between")}>
          <span className={classNames("h5", tw("space-x-4"))}>
            {formatMoney(assetPrice)}
          </span>
        </div>
      </div>
      <div className={tw("flex", "flex-col", "justify-center", "space-y-1")}>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          {t`Price (${baseAssetSymbol})`}
        </span>
        <span className={classNames("h5", tw("truncate"))}>0.997</span>
      </div>
    </div>
  );
}

function useTokensSummary(
  pool: PoolContract | undefined,
  interestSupply: number
): TokensSummary {
  const { currency } = useCurrencyPref();
  const { data: [tokens, balances] = [undefined, undefined] } = usePoolTokens(
    pool
  );

  const {
    termAssetIndex,
    baseAssetContract,
    termAssetContract,
  } = parseSortedTokensForPool(tokens);
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);

  // Base Asset Info
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const [baseAssetPriceYesterday] = useTokenHistoricalPrice(
    baseAssetContract,
    currency,
    1
  );

  const fixedYield = useTokenYield(baseAssetContract, pool, "principal");
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);

  // Term Asset Info
  const termAssetBalance = balances?.[termAssetIndex];
  const vaultSymbol = getVaultSymbol(baseAsset);
  const { symbol: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    vaultSymbol
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

  let termAssetBalanceTrend;

  const accumulatedFiatInterest = useAccumulatedFiatInterestForTranche(
    baseAssetContract,
    pool
  );

  const accumulatedInterest = useAccumulatedInterestForTranche(pool);

  const fiatInterestPerToken = interestSupply
    ? accumulatedFiatInterest?.divide(interestSupply, Math.round)
    : undefined;

  const interestPerToken = interestSupply
    ? +formatUnits(accumulatedInterest || 0, termAssetDecimals) / interestSupply
    : undefined;

  return {
    baseAssetSymbol,
    termAssetContract,
    termAssetSymbol,
    termAssetBalance,
    termAssetBalanceTrend,
    termAssetDecimals,
    termAssetPrice,
    termAssetPriceTrend,
    fixedYield,
    fiatInterestPerToken,
    interestPerToken,
  };
}
