import React, { ReactElement, useCallback } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { calculateLPOutGivenIn } from "efi/pools/calculateLPOutGivenIn";

import styles from "./StakingInput.module.css";
import { SvgIcon } from "efi-ui/base/SvgIcon";

interface StakingInputProps {
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  CryptoAssetIcon: SvgIcon | undefined;

  disabled: boolean;
  onCalculateLPOutGivenIn: (otherNeeded: string, lpOut: number) => void;
  onChangeInputValue: (inputValue: string) => void;
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
    cryptoDecimals,
    CryptoAssetIcon,
    disabled,
    onChangeInputValue,
    onCalculateLPOutGivenIn,
    value = "",
    validValue,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply,
  } = props;

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const userInputValue = event.target.value;
      onChangeInputValue(userInputValue);

      const { otherNeeded, lpOut } = calculateLPOutGivenIn(
        +userInputValue,
        Number.MAX_SAFE_INTEGER,
        tokenPoolReserves ?? 0,
        otherTokenPoolReserves ?? 0,
        totalSupply ?? 0
      );

      // TODO:  JS can't handle 18 decimals.  need to use fixedpoint math for calculateLPOutGivenIn
      // so we can go straight from BigNumber to string.
      const decimals = Math.min(cryptoDecimals || 10, 10);
      onCalculateLPOutGivenIn(
        otherNeeded ? otherNeeded.toFixed(decimals).toString() : "",
        lpOut
      );
    },
    [
      onChangeInputValue,
      tokenPoolReserves,
      otherTokenPoolReserves,
      totalSupply,
      onCalculateLPOutGivenIn,
      cryptoDecimals,
    ]
  );

  return (
    <div className={tw("flex", "flex-col", "space-y-2")}>
      <InputGroup
        disabled={disabled}
        onChange={onChange}
        value={value}
        className={styles.tokenInput}
        large
        intent={validValue ? undefined : Intent.DANGER}
        rightElement={
          <Tag large minimal>
            <span>{cryptoSymbol}</span>
          </Tag>
        }
        leftElement={
          <div className={tw("flex", "items-center", "px-2")}>
            {CryptoAssetIcon ? (
              <CryptoAssetIcon height={18} width={18} />
            ) : null}
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
