import React, { ChangeEvent, ReactElement, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { calculateLPOutGivenInFixed } from "efi/pools/calculateLPOutGivenIn";

import styles from "./StakingInput.module.css";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";

interface StakingInputProps {
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  cryptoAssetIcon: SvgIcon | undefined;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  disabled: boolean;
  onCalculateLPOutGivenIn: (
    otherNeeded: string | undefined,
    lpOut: string | undefined
  ) => void;
  onChangeInputValue: (inputValue: string) => void;
  label: string | undefined;
  value: string | undefined;
  validValue: boolean;
  tokenPoolReserves: string | undefined;
  otherTokenPoolReserves: string | undefined;
  totalSupply: string | undefined;
}

export function StakingInput(props: StakingInputProps): ReactElement {
  const {
    cryptoSymbol,
    cryptoDecimals,
    cryptoAssetIcon: CryptoAssetIcon,
    cryptoBalanceOf,
    cryptoDisplayBalance,
    disabled,
    onChangeInputValue,
    onCalculateLPOutGivenIn,
    label,
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

      if (
        !tokenPoolReserves ||
        !otherTokenPoolReserves ||
        !totalSupply ||
        !cryptoDecimals
      ) {
        onCalculateLPOutGivenIn(undefined, undefined);
        return;
      }
      const { otherNeeded, lpOut } = calculateLPOutGivenInFixed(
        safeValue,
        tokenPoolReserves,
        otherTokenPoolReserves,
        totalSupply,
        cryptoDecimals
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

  const setMaxValue = useSetMaxValue(cryptoBalanceOf, onChange, cryptoDecimals);
  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <div className={tw("flex", "justify-between", "items-center")}>
        <span className={tw("text-xs", "text-right")}>{label}</span>
        <Button
          disabled={false}
          onClick={setMaxValue}
          minimal
          outlined
          small
          intent={Intent.SUCCESS}
        >{t`MAX`}</Button>
      </div>
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

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  setValue: (event: React.ChangeEvent<HTMLInputElement>) => void,
  tokenDecimals: number | undefined
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      const event = {
        target: { value: maxValue },
      } as ChangeEvent<HTMLInputElement>;
      setValue(event);
    }
  }, [tokenBalanceOf, setValue, tokenDecimals]);
}
