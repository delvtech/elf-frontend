import React, { FC } from "react";

import { Card, Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import { formatUnits, parseUnits } from "@ethersproject/units";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { BigNumber } from "ethers";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { KNOWN_BASE_ASSETS } from "efi/contracts/contractsJson";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

interface TokenSummaryProps {
  pool: PoolContract | undefined;
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;
}

export const TokenSummary: FC<TokenSummaryProps> = ({
  pool,
  tokenIn,
  tokenOut,
}) => {
  const {
    baseAssetSymbol,
    baseAssetBalance,
    baseAssetDecimals,
    baseAssetPrice,
    yieldAssetSymbol,
    yieldAssetBalance,
    yieldAssetDecimals,
    yieldAssetPrice,
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
              <span className={tw("text-lg")}>{baseAssetSymbol}</span>
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
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
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
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
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
              <span className={tw("text-lg")}>{yieldAssetSymbol}</span>
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
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
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
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

interface TokensSummary {
  baseAssetContract: ERC20 | undefined;
  baseAssetSymbol: string | undefined;
  baseAssetBalance: BigNumber | undefined;
  baseAssetDecimals: number | undefined;
  baseAssetPrice: Money | undefined;
  yieldAssetContract: ERC20 | undefined;
  yieldAssetSymbol: string | undefined;
  yieldAssetBalance: BigNumber | undefined;
  yieldAssetDecimals: number | undefined;
  yieldAssetPrice: Money | undefined;
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
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);

  const yieldAssetIndex = baseAssetIndex === 0 ? 1 : 0;
  const yieldAssetAddress = tokens?.[yieldAssetIndex];
  const yieldAssetBalance = balances?.[yieldAssetIndex];
  const yieldAssetContract = yieldAssetAddress
    ? ERC20__factory.connect(yieldAssetAddress, jsonRpcProvider)
    : undefined;
  const [yieldAssetSymbol] = useTokenSymbol(yieldAssetContract);
  const [yieldAssetDecimals] = useTokenDecimals(yieldAssetContract);

  // TODO: refactor this to its own hook
  /**************************
   * Lazy spot price technique until we get a better method.  Right now just calculates how much out
   * asset for '1' of the in asset.  A future optimisation might be to do '$1' worth of the in asset
   * to minimize slippage in the value.
   **************************/
  const amountIn = parseUnits("1", baseAssetDecimals);
  const { data: amountOut = BigNumber.from(1) } = useOnSwapGivenIn(
    pool,
    baseAssetContract,
    amountIn
  );
  /***************************** */

  const yieldAssetRatio =
    +formatUnits(amountIn, baseAssetDecimals) /
    +formatUnits(amountOut, yieldAssetDecimals);
  const yieldAssetPrice = Money.fromDecimal(
    +yieldAssetRatio * (baseAssetPrice?.toDecimal() || 1),
    currency,
    Math.round
  );

  return {
    baseAssetContract,
    baseAssetSymbol,
    baseAssetBalance,
    baseAssetDecimals,
    baseAssetPrice,
    yieldAssetContract,
    yieldAssetSymbol,
    yieldAssetBalance,
    yieldAssetDecimals,
    yieldAssetPrice,
  };
}
