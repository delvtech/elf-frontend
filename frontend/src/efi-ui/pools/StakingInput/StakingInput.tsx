import React, { ReactElement, useCallback } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { calculateLPOutGivenInFixed } from "efi/pools/calculateLPOutGivenIn";

import styles from "./StakingInput.module.css";

interface StakingInputProps {
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  cryptoAssetIcon: SvgIcon | undefined;

  disabled: boolean;
  onCalculateLPOutGivenIn: (otherNeeded: string, lpOut: string) => void;
  onChangeInputValue: (inputValue: string) => void;
  value: string | undefined;
  validValue: boolean;
  tokenPoolReserves: string | undefined;
  otherTokenPoolReserves: string | undefined;
  totalSupply: string | undefined;
}

export function StakingInput(props: StakingInputProps): ReactElement {
  const {
    cryptoDisplayBalance,
    cryptoSymbol,
    cryptoDecimals,
    cryptoAssetIcon: CryptoAssetIcon,
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
      const safeValue = clipStringValueToDecimals(
        userInputValue,
        cryptoDecimals || 18
      );
      onChangeInputValue(safeValue);

      const { otherNeeded, lpOut } = calculateLPOutGivenInFixed(
        userInputValue || "0",
        Number.MAX_SAFE_INTEGER.toString(),
        tokenPoolReserves?.toString() || "0",
        otherTokenPoolReserves?.toString() || "0",
        cryptoDecimals || 18,
        totalSupply?.toString() || "0"
      );

      onCalculateLPOutGivenIn(otherNeeded, lpOut);
    },
    [
      cryptoDecimals,
      onChangeInputValue,
      tokenPoolReserves,
      otherTokenPoolReserves,
      totalSupply,
      onCalculateLPOutGivenIn,
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
