import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { CryptoIcon } from "efi/ui/crypto/CryptoIcon";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import styles from "efi/ui/crypto/TransactionForm/TransactionForm.module.css";

export const TransactionForm: FC<TransactionFormProps> = ({
  inputLabel,
  cryptoSymbol,
  cryptoBalance,
  buttonLabel,
}) => {
  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <span>{inputLabel}</span>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          className={styles.depositInput}
          large
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
          className={tw("text-xs", "text-right")}
        >{t`Available: ${cryptoBalance} ${cryptoSymbol}`}</span>
      </div>
      <Button minimal outlined large intent={Intent.PRIMARY}>
        {buttonLabel}
      </Button>
    </div>
  );
};
interface TransactionFormProps {
  inputLabel: string;
  buttonLabel: string;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: string;
}
