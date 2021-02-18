import React, { FC, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useERC20Contract } from "efi-ui/contracts/useERC20Contract";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import styles from "efi-ui/crypto/TradePanel/TradePanel.module.css";
import { useMarketContract } from "efi-ui/markets/useMarketContract";
import { usePairedAssetPrice } from "efi-ui/markets/usePairedAssetPrice";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { Market, MarketAsset } from "efi/markets/Market";

interface TradePanelProps {
  accountAddress: string | null | undefined;
  market: Market | undefined;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  tradeCryptoSymbol: CryptoSymbolOld;
  tradeCryptoBalance: TokenBalance | undefined;
  receiveCryptoSymbol: CryptoSymbolOld;
  receiveCryptoBalance: TokenBalance | undefined;
  onTransaction: (amount: BigNumber) => void;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

export const TradePanel: FC<TradePanelProps> = ({
  formDisabled = false,
  submitDisabled = false,
  inputLabel,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
  market,
  accountAddress,
}) => {
  let baseAsset: MarketAsset = {} as MarketAsset;
  let yieldAsset: MarketAsset = {} as MarketAsset;
  if (market) {
    const { assets } = market;
    baseAsset = assets[0];
    yieldAsset = assets[1];
  }

  const marketContract = useMarketContract(market?.contractAddress);

  const baseAssetContract = useERC20Contract(baseAsset.address);
  const baseAssetBalance = useTokenBalance(baseAssetContract, accountAddress);
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);
  const [baseAssetBalanceOf] = useTokenBalanceOf(
    baseAssetContract,
    accountAddress
  );

  const yieldAssetContract = useERC20Contract(yieldAsset.address);
  const yieldAssetBalance = useTokenBalance(yieldAssetContract, accountAddress);
  const [yieldAssetBalanceOf] = useTokenBalanceOf(
    yieldAssetContract,
    accountAddress
  );
  const [yieldAssetDecimals] = useTokenDecimals(yieldAssetContract);

  const { data: spotPrice } = usePairedAssetPrice(
    marketContract?.address,
    baseAsset.address
  );

  let price;
  if (spotPrice) {
    price = 1 / +formatEther(spotPrice);
  }

  const tradeCryptoBalance = baseAssetBalanceOf;
  const tradeCryptoDisplayBalance = baseAssetBalance;
  const tradeCryptoSymbol = baseAsset.symbol;
  const tradeCryptoDecimals = baseAssetDecimals;

  const receiveCryptoBalance = yieldAssetBalanceOf;
  const receiveCryptoDisplayBalance = yieldAssetBalance;
  const receiveCryptoSymbol = yieldAsset.symbol;
  const receiveCryptoDecimals = yieldAssetDecimals;

  const [stringValue, onChange, setValue] = useNumericInput(
    numericInputOptions
  );
  const switchAssets = useCallback(() => {}, []);

  const value = stringValue
    ? parseUnits(stringValue, tradeCryptoDecimals)
    : undefined;
  const validValue =
    value && tradeCryptoBalance ? value.lte(tradeCryptoBalance) : true;

  const onClick = useCallback(async () => {
    if (validValue && onTransaction) {
      if (!value) {
        return;
      }
      await onTransaction(value);
      // TODO: Hack to reset the value of the Numeric Input. This should instead
      // call onResetValue or something from userNumericInput instead.
      onChange({ target: { value: "" } } as any);
    }
  }, [onChange, onTransaction, validValue, value]);

  const setMaxValue = useCallback(() => {
    if (tradeCryptoBalance) {
      setValue(formatEther(tradeCryptoBalance));
    }
  }, [tradeCryptoBalance, setValue]);

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      {/* Trade Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{inputLabel}</span>
        <Button
          disabled={formDisabled}
          onClick={setMaxValue}
          minimal
          outlined
          small
          intent={Intent.SUCCESS}
        >{t`MAX`}</Button>
      </div>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          disabled={formDisabled}
          onChange={onChange}
          value={stringValue}
          className={styles.depositInput}
          large
          intent={validValue ? undefined : Intent.DANGER}
          rightElement={
            <Tag large minimal>
              <span>{tradeCryptoSymbol}</span>
            </Tag>
          }
          leftElement={
            <div className={tw("px-2")}>
              {tradeCryptoSymbol === ("ELF" as any) ||
              !CryptoIcon[tradeCryptoSymbol as CryptoSymbol] ? (
                "✨"
              ) : (
                <img
                  className={tw("h-5", "w-5")}
                  src={CryptoIcon[tradeCryptoSymbol as CryptoSymbolOld]}
                  alt={CryptoName[tradeCryptoSymbol as CryptoSymbolOld]}
                />
              )}
            </div>
          }
        />
        <div className={tw("flex", "justify-between")}>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{t`Balance:`}</span>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{`${tradeCryptoDisplayBalance} ${tradeCryptoSymbol}`}</span>
        </div>
      </div>

      <Button
        icon={IconNames.ARROWS_VERTICAL}
        onClick={switchAssets}
        minimal
        large
        intent={buttonIntent}
      ></Button>

      {/* Receive Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{t`For`}</span>
      </div>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          disabled={formDisabled}
          onChange={onChange}
          value={stringValue}
          className={styles.depositInput}
          large
          intent={validValue ? undefined : Intent.DANGER}
          rightElement={
            <Tag large minimal>
              <span>{receiveCryptoSymbol}</span>
            </Tag>
          }
          leftElement={
            <div className={tw("px-2")}>
              {receiveCryptoSymbol === ("ELF" as any) ||
              !CryptoIcon[receiveCryptoSymbol as CryptoSymbol] ? (
                "✨"
              ) : (
                <img
                  className={tw("h-5", "w-5")}
                  src={CryptoIcon[receiveCryptoSymbol as CryptoSymbolOld]}
                  alt={CryptoName[receiveCryptoSymbol as CryptoSymbolOld]}
                />
              )}
            </div>
          }
        />
        <div className={tw("flex", "justify-between")}>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{t`Balance:`}</span>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{`${receiveCryptoDisplayBalance} ${receiveCryptoSymbol}`}</span>
        </div>
      </div>
      <Button
        disabled={!value || !validValue || submitDisabled || formDisabled}
        onClick={onClick}
        minimal
        outlined
        large
        intent={buttonIntent}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
