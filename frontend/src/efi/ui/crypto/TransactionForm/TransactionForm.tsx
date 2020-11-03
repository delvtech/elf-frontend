import React, { FC, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { commify, formatEther, parseEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi/ui/base/useBoolean/useNumericInput/useNumericInput";
import { CryptoIcon } from "efi/ui/crypto/CryptoIcon";
import styles from "efi/ui/crypto/TransactionForm/TransactionForm.module.css";

interface TransactionFormProps {
  buttonEnabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: BigNumber | undefined;
  onTransaction: (amount: BigNumber) => Promise<void>;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

export const TransactionForm: FC<TransactionFormProps> = ({
  buttonEnabled = true,
  inputLabel,
  cryptoSymbol,
  cryptoBalance,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
}) => {
  const [stringValue, onChange] = useNumericInput(numericInputOptions);
  const value = stringValue ? parseEther(stringValue) : undefined;
  const validValue = value && cryptoBalance ? value.lte(cryptoBalance) : true;

  // TODO: make this component handle any type of crypto.  We'll formalize this into a function that
  // does the proper operations depending on the asset.  This is fine for V0.
  const ethBalance = cryptoBalance && commify(formatEther(cryptoBalance));

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

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <span>{inputLabel}</span>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          onChange={onChange}
          value={stringValue}
          className={styles.depositInput}
          large
          intent={validValue ? undefined : Intent.DANGER}
          rightElement={
            <Tag large minimal>
              <span>{cryptoSymbol}</span>
            </Tag>
          }
          leftElement={
            <div className={tw("px-2")}>
              {cryptoSymbol === ("ELF" as any) ? (
                "✨"
              ) : (
                <img
                  className={tw("h-5", "w-5")}
                  src={CryptoIcon[cryptoSymbol as keyof typeof CryptoSymbol]}
                  alt={CryptoName[cryptoSymbol as keyof typeof CryptoSymbol]}
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
          >{`${ethBalance} ${cryptoSymbol}`}</span>
        </div>
      </div>
      <Button
        disabled={!value || !validValue || !buttonEnabled}
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
