import React, { ReactElement, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { calculateLPOutGivenInFixed } from "efi/pools/calculateLPOutGivenIn";

import styles from "./StakingInput.module.css";

interface StakingInputProps {
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  cryptoAssetIcon: TokenIcon | undefined;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  disabled: boolean;
  onPreviewUpdate: (
    otherNeeded: string | undefined,
    lpOut: string | undefined
  ) => void;
  onChange: (inputValue: string) => void;
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
    onChange: onChangeFromProps,
    onPreviewUpdate,
    label,
    value = "",
    validValue,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply,
  } = props;

  const onChange = useOnInputChange(
    onChangeFromProps,
    onPreviewUpdate,
    cryptoDecimals,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply
  );

  const setMaxValue = useSetMaxValue(
    cryptoBalanceOf,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply,
    cryptoDecimals,
    onChangeFromProps,
    onPreviewUpdate
  );

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

function useOnInputChange(
  onChangeFromProps: (inputValue: string) => void,
  onPreviewUpdate: (
    otherNeeded: string | undefined,
    lpOut: string | undefined
  ) => void,
  cryptoDecimals: number | undefined,
  tokenPoolReserves: string | undefined,
  otherTokenPoolReserves: string | undefined,
  totalSupply: string | undefined
) {
  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const userInputValue = event.target.value;

      // allow user to clear input
      if (userInputValue === undefined || userInputValue === "") {
        onChangeFromProps("");
        onPreviewUpdate(undefined, undefined);
        return;
      }

      // try to get safe value by handling edge cases and clipping decimals
      const safeValue = clipStringValueToDecimals(
        userInputValue,
        cryptoDecimals || 18
      );

      // if value is not undefiend, then check if it is valid.  if not, we want to ignore the user's
      // input
      if (!validateInput(safeValue) || safeValue === undefined) {
        return;
      }

      // valid value so ok to set
      onChangeFromProps(safeValue);

      // values may be undefined while loading, prevent calling calcLPOutGivenInFixed
      if (
        !tokenPoolReserves ||
        !otherTokenPoolReserves ||
        !totalSupply ||
        !cryptoDecimals
      ) {
        return;
      }

      const { otherNeeded, lpOut } = calculateLPOutGivenInFixed(
        safeValue,
        tokenPoolReserves,
        otherTokenPoolReserves,
        totalSupply,
        cryptoDecimals
      );

      onPreviewUpdate(otherNeeded, lpOut);
    },
    [
      cryptoDecimals,
      onChangeFromProps,
      tokenPoolReserves,
      otherTokenPoolReserves,
      totalSupply,
      onPreviewUpdate,
    ]
  );
}

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  tokenPoolReserves: string | undefined,
  otherTokenPoolReserves: string | undefined,
  totalSupply: string | undefined,
  tokenDecimals: number | undefined,
  onChange: (value: string) => void,
  onPreviewUpdate: (
    value: string | undefined,
    lpOut: string | undefined
  ) => void
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      // fix this to pass lpOut
      onChange(maxValue);

      // values may be undefined while loading, prevent calling calcLPOutGivenInFixed
      if (
        !tokenPoolReserves ||
        !otherTokenPoolReserves ||
        !totalSupply ||
        !tokenDecimals
      ) {
        return;
      }
      const { otherNeeded, lpOut } = calculateLPOutGivenInFixed(
        maxValue,
        tokenPoolReserves,
        otherTokenPoolReserves,
        totalSupply,
        tokenDecimals
      );
      onPreviewUpdate(otherNeeded, lpOut);
    }
  }, [
    tokenBalanceOf,
    tokenDecimals,
    onChange,
    tokenPoolReserves,
    otherTokenPoolReserves,
    totalSupply,
    onPreviewUpdate,
  ]);
}
