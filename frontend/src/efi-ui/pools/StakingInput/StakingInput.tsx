import React, { ReactElement, useCallback, useState } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

import styles from "./StakingInput.module.css";
import { calculateLPOutGivenIn } from "efi/pools/calculateLPOutGivenIn";

interface StakingInputProps {
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;

  disabled: boolean;
  onChange: (otherNeeded: number, lpOut: number) => void;
  value: string | undefined;
  validValue: boolean;
  tokenPoolReserves: number | undefined;
  otherTokenPoolReserves: number | undefined;
  totalSupply: number | undefined;
}

export function StakingInput(props: StakingInputProps): ReactElement {
  const {
    cryptoDisplayBalance,
    cryptoSymbol,
    disabled,
    onChange,
    value = "",
    validValue,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply,
  } = props;
  const [tokenValue, setTokenValue] = useState(value);

  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setTokenValue(value);

      const { otherNeeded, lpOut } = calculateLPOutGivenIn(
        +value,
        Number.MAX_SAFE_INTEGER,
        tokenPoolReserves ?? 0,
        otherTokenPoolReserves ?? 0,
        totalSupply ?? 0
      );

      onChange(otherNeeded, lpOut);
    },
    [onChange, otherTokenPoolReserves, tokenPoolReserves, totalSupply]
  );

  return (
    <div className={tw("flex", "flex-col", "space-y-2")}>
      <InputGroup
        disabled={disabled}
        onChange={_onChange}
        value={tokenValue}
        className={styles.tokenInput}
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
