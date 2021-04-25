import React, { ReactElement, useCallback, useEffect, useState } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./TradeInput.module.css";

interface TradeInputProps {
  cryptoAddress: string | undefined;
  cryptoDisplayBalance: string | number;
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  otherCryptoAddress: string | undefined;
  otherCryptoIndex: number | undefined;

  disabled: boolean;
  onChangeThisValue: (value: string | undefined) => void;
  onChangeOtherValue: (value: string | undefined) => void;
  value: string | undefined;
  validValue: boolean;
  swapKind: SwapKind;
  pool: PoolContract | undefined;
}

export function TradeInput(props: TradeInputProps): ReactElement {
  const {
    cryptoAddress,
    cryptoDisplayBalance,
    cryptoSymbol,
    cryptoDecimals,
    otherCryptoAddress,
    otherCryptoIndex,
    disabled,
    onChangeThisValue,
    onChangeOtherValue,
    value = "",
    validValue,
    swapKind,
    pool,
  } = props;

  const [amount, setAmount] = useState("");

  const tokenInAddress =
    swapKind === SwapKind.GIVEN_IN ? cryptoAddress : otherCryptoAddress;
  const tokenOutAddress =
    swapKind === SwapKind.GIVEN_OUT ? cryptoAddress : otherCryptoAddress;
  const { data: swap } = useQueryBatchSwap(
    swapKind,
    pool,
    tokenInAddress,
    tokenOutAddress,
    parseUnits(amount || "0", cryptoDecimals ?? 18)
  );

  const otherValue = swap?.[otherCryptoIndex ?? 1];
  const otherStringValue = otherValue
    ? formatUnits(otherValue.abs(), cryptoDecimals)
    : undefined;

  useEffect(() => {
    onChangeOtherValue(otherStringValue);
  }, [onChangeOtherValue, otherStringValue]);

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
        setAmount("");
        onChangeThisValue("");
        onChangeOtherValue(undefined);
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

      onChangeThisValue(safeValue);

      setAmount(safeValue);
    },
    [cryptoDecimals, onChangeThisValue, onChangeOtherValue]
  );

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
