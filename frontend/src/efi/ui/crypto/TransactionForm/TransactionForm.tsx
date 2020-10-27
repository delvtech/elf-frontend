import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { CryptoIcon } from "efi/ui/crypto/CryptoIcon";
import React, { FC, useCallback, useState } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import styles from "efi/ui/crypto/TransactionForm/TransactionForm.module.css";

interface TransactionFormProps {
  inputLabel: string;
  buttonLabel: string;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: string;
  onTransaction: (amount: number) => void;
}

export const TransactionForm: FC<TransactionFormProps> = ({
  inputLabel,
  cryptoSymbol,
  cryptoBalance,
  buttonLabel,
  onTransaction,
}) => {
  const [value, setValue] = useState<string | undefined>(undefined);
  const updateValue = useCallback((event) => {
    const inputValue = event.target.value;
    setValue(inputValue);
  }, []);

  let validValue = true;
  if (value && cryptoBalance) {
    validValue = Number(value) <= Number(cryptoBalance);
  }

  const onClick = useCallback(() => {
    if (validValue && onTransaction) {
      onTransaction(Number(value));
    }
  }, [onTransaction, validValue, value]);

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <span>{inputLabel}</span>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          onChange={updateValue}
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
        >{t`Available: ${cryptoBalance} ${cryptoSymbol}`}</span>
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
