import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import React, { FC, useCallback } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import styles from "efi-ui/crypto/TradePanel/TradePanel.module.css";

import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { TokenBalance } from "efi/crypto/TokenBalance";

interface TradePanelProps {
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  tradeCryptoSymbol: CryptoSymbol;
  tradeCryptoBalance: TokenBalance | undefined;
  receiveCryptoSymbol: CryptoSymbol;
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
  tradeCryptoSymbol,
  tradeCryptoBalance,
  receiveCryptoSymbol,
  receiveCryptoBalance,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
}) => {
  const [stringValue, onChange, setValue] = useNumericInput(
    numericInputOptions
  );
  const value = stringValue
    ? parseUnits(stringValue, tradeCryptoBalance?.decimals)
    : undefined;
  const validValue =
    value && tradeCryptoBalance ? value.lte(tradeCryptoBalance.value) : true;

  const balance = formatCurrency(
    tradeCryptoBalance?.value,
    tradeCryptoBalance?.decimals.toNumber()
  );

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
    setValue(formatEther(tradeCryptoBalance?.value as BigNumber));
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
              {tradeCryptoSymbol === ("ELF" as any) ? (
                "✨"
              ) : (
                <img
                  className={tw("h-5", "w-5")}
                  src={CryptoIcon[tradeCryptoSymbol as CryptoSymbol]}
                  alt={CryptoName[tradeCryptoSymbol as CryptoSymbol]}
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
          >{`${balance} ${tradeCryptoSymbol}`}</span>
        </div>
      </div>

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
              {receiveCryptoSymbol === ("ELF" as any) ? (
                "✨"
              ) : (
                <img
                  className={tw("h-5", "w-5")}
                  src={CryptoIcon[receiveCryptoSymbol as CryptoSymbol]}
                  alt={CryptoName[receiveCryptoSymbol as CryptoSymbol]}
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
          >{`${balance} ${receiveCryptoSymbol}`}</span>
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
