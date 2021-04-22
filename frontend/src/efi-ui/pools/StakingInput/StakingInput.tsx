import React, { ReactElement, useCallback } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { calculateLPOutGivenInFixed } from "efi/pools/calculateLPOutGivenIn";

import styles from "./StakingInput.module.css";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";

interface StakingInputProps {
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  cryptoAssetIcon: SvgIcon | undefined;

  disabled: boolean;
  onCalculateLPOutGivenIn: (
    otherNeeded: string | undefined,
    lpOut: string | undefined
  ) => void;
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

      // TODO: Think about getting this logic outta here. We should be dumb and unconditionally call
      // onChangeInputValue and onCalculateLPOutGivenIn and let the consumer figure this out.  Also,
      // onCalculateLPOutGivenIn should just be 'onChangeOther' with the userInput.
      // I want to share this logic with all the other inputs because it super safe and doesn't blow
      // up.

      // allow user to clear input
      if (userInputValue === undefined || userInputValue === "") {
        onChangeInputValue("");
        onCalculateLPOutGivenIn(undefined, undefined);
        return;
      }

      // try to get safe value by handling edge cases and clipping decimals
      const safeValue = clipStringValueToDecimals(
        userInputValue,
        cryptoDecimals || 18
      );

      // if value is not undefiend, then check if its invalid.  if so, we want to ignore the user's input
      if (!validateInput(safeValue) || safeValue === undefined) {
        return;
      }

      onChangeInputValue(safeValue);

      const { otherNeeded, lpOut } = calculateLPOutGivenInFixed(
        safeValue,
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
