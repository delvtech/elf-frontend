import React, { FC, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi/ui/base/useBoolean/useNumericInput/useNumericInput";
import { CryptoIcon } from "efi/ui/crypto/CryptoIcon";
import styles from "efi/ui/crypto/TransactionForm/TransactionForm.module.css";

interface TransactionFormProps {
  inputLabel: string;
  buttonLabel: string;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: BigNumber | undefined;
  onTransaction: (amount: BigNumber) => void;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

export const TransactionForm: FC<TransactionFormProps> = ({
  inputLabel,
  cryptoSymbol,
  cryptoBalance,
  buttonLabel,
  onTransaction,
}) => {
  const [stringValue, onChange] = useNumericInput(numericInputOptions);
  const value = stringValue ? parseEther(stringValue) : undefined;
  const validValue = value && cryptoBalance ? value.lte(cryptoBalance) : true;

  // TODO: make this component handle any type of crypto.  We'll formalize this into a function that
  // does the proper operations depending on the asset.  This is fine for V0.
  const ethBalance = cryptoBalance && formatEther(cryptoBalance);

  const onClick = useCallback(() => {
    if (validValue && onTransaction) {
      if (!value) {
        return;
      }
      onTransaction(value);
    }
  }, [onTransaction, validValue, value]);

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
              <img
                className={tw("h-5", "w-5")}
                src={CryptoIcon[cryptoSymbol as keyof typeof CryptoSymbol]}
                alt={CryptoName[cryptoSymbol as keyof typeof CryptoSymbol]}
              />
            </div>
          }
        />
        <span
          className={tw("text-xs", "text-right", {
            "text-red-500": !validValue,
          })}
        >{t`Available: ${ethBalance} ${cryptoSymbol}`}</span>
      </div>
      <Button
        disabled={!value || !validValue}
        onClick={onClick}
        minimal
        outlined
        large
        intent={Intent.PRIMARY}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
