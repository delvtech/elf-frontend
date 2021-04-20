import React, { ReactElement } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

import styles from "./TradeInput.module.css";

interface TradeInputProps {
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;

  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string | undefined;
  validValue: boolean;
}

export function TradeInput(props: TradeInputProps): ReactElement {
  const {
    cryptoDisplayBalance,
    cryptoSymbol,
    disabled,
    onChange,
    value = "",
    validValue,
  } = props;
  return (
    <div className={tw("flex", "flex-col", "space-y-2")}>
      <InputGroup
        disabled={disabled}
        onChange={onChange}
        value={value}
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
            {cryptoSymbol === ("ELF" as CryptoSymbol) ||
            !CryptoIcon[cryptoSymbol as CryptoSymbol] ? (
              "✨"
            ) : (
              <img
                className={tw("h-5", "w-5")}
                src={CryptoIcon[cryptoSymbol as CryptoSymbol]}
                alt={CryptoName[cryptoSymbol as CryptoSymbol]}
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
        >{`${cryptoDisplayBalance} ${cryptoSymbol}`}</span>
      </div>
    </div>
  );
}
