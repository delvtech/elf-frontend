import { ReactElement, useCallback, useEffect, useState } from "react";

import { InputGroup, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/earn/EarnInput/EarnInput.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { PoolContract } from "efi/pools/PoolContract";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";

interface EarnInputProps {
  showMaxButton: boolean;
  assetBalance: number;
  value: string | undefined;
  onValueChange: (value: string | undefined) => void;
  onPreviewUpdate: (value: string | undefined) => void;
  className?: string;

  placeholder?: string;

  assetPicker: ReactElement;
  swapKind: SwapKind;
  pool: PoolContract | undefined;
  cryptoAddress: string | undefined;
  cryptoDecimals: number | undefined;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  previewCryptoAddress: string | undefined;
  previewCryptoPoolIndex: number | undefined;
}

export function EarnInput({
  className,
  value,
  showMaxButton,
  placeholder,
  assetBalance,
  onValueChange: onChangeFromProps,
  onPreviewUpdate,
  assetPicker,
  swapKind,
  pool,
  cryptoAddress,
  cryptoDecimals,
  cryptoBalanceOf,
  previewCryptoAddress,
  previewCryptoPoolIndex,
}: EarnInputProps): ReactElement {
  const { isDarkMode } = useDarkMode();

  // changes to this will trigger calculating and calling handler to update the other value.  we
  // need to do this because the calculation is asynchronous so we can't update the preview directly
  // in the useOnInputChange handler
  const [internalValue, setInternalValue] = useState("");

  // handles user input changes.  call onChangeThisValue to tell the parent the value changed.  also
  // updates the internal value.
  const onChange = useOnInputChange(
    setInternalValue,
    onChangeFromProps,
    onPreviewUpdate,
    cryptoDecimals
  );

  // watches for updates to internal value, calculate preview value and calls onPreviewUpdate
  useUpdatePreviewValue(
    swapKind,
    cryptoAddress,
    previewCryptoAddress,
    pool,
    internalValue,
    cryptoDecimals,
    previewCryptoPoolIndex,
    onPreviewUpdate
  );

  // TODO: disable setting max value if the user balance >  pool balance.  better yet, disable max
  // value if the trade would cause too much slippage.

  // sets the max value for the input
  const setMaxValue = useSetMaxValue(
    cryptoBalanceOf, // the max value
    cryptoDecimals,
    setInternalValue,
    onChangeFromProps
  );

  const maxButtonElement = showMaxButton ? (
    <div className={tw("px-4")}>
      <Tag minimal interactive onClick={setMaxValue}>{t`MAX`}</Tag>
    </div>
  ) : undefined;

  return (
    <InputGroup
      placeholder={placeholder}
      style={{
        height: "94px",
        width: "100%",
        fontSize: 26,
      }}
      className={classNames(
        tw("w-full"),
        styles.investmentAmount,
        { [styles.investmentAmountLightMode]: !isDarkMode },
        className
      )}
      value={value}
      large
      leftElement={assetPicker}
      rightElement={maxButtonElement}
      onChange={onChange}
    />
  );
}

function useOnInputChange(
  setInternalValue: (value: string) => void,
  onChange: (value: string | undefined) => void,
  onPreviewUpdate: (value: string | undefined) => void,
  cryptoDecimals: number | undefined
) {
  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const userInputValue = event.target.value;

      // sets internal value
      validateAndSetValue(
        userInputValue,
        setInternalValue,
        onChange,
        onPreviewUpdate,
        cryptoDecimals
      );
    },
    [setInternalValue, onChange, onPreviewUpdate, cryptoDecimals]
  );
}

function useUpdatePreviewValue(
  swapKind: SwapKind,
  cryptoAddress: string | undefined,
  previewCryptoAddress: string | undefined,
  pool: PoolContract | undefined,
  internalValue: string,
  cryptoDecimals: number | undefined,
  previewCryptoIndex: number | undefined,
  onChangeOtherValue: (value: string | undefined) => void
) {
  const tokenInAddress =
    swapKind === SwapKind.GIVEN_IN ? cryptoAddress : previewCryptoAddress;
  const tokenOutAddress =
    swapKind === SwapKind.GIVEN_OUT ? cryptoAddress : previewCryptoAddress;

  // get the preview value
  const { data: swap } = useQueryBatchSwap(
    swapKind,
    pool,
    tokenInAddress,
    tokenOutAddress,
    parseUnits(internalValue || "0", cryptoDecimals ?? 18)
  );

  const otherValue = swap?.[previewCryptoIndex ?? 1];
  const otherStringValue = otherValue
    ? formatUnits(otherValue.abs(), cryptoDecimals)
    : undefined;

  useEffect(() => {
    // let parent know preview value updated
    onChangeOtherValue(otherStringValue);
  }, [onChangeOtherValue, otherStringValue]);
}

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  tokenDecimals: number | undefined,
  setInternalValue: (value: string) => void,
  onChange: (value: string | undefined) => void
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      setInternalValue(maxValue);
      onChange(maxValue);
    }
  }, [tokenBalanceOf, tokenDecimals, setInternalValue, onChange]);
}

function validateAndSetValue(
  value: string,
  setInternalValue: (value: string) => void,
  onChange: (value: string | undefined) => void,
  updatePreviewValue: (value: string | undefined) => void,
  cryptoDecimals: number | undefined
) {
  // allow user to clear input
  if (value === "") {
    setInternalValue("");
    onChange("");
    updatePreviewValue("");
    return;
  }

  // get safe value by handling edge cases and clipping decimals
  const safeValue = clipStringValueToDecimals(value, cryptoDecimals || 18);

  // if value is not undefiend, then check if its invalid.  if so, we want to ignore the user's input
  if (!validateInput(safeValue) || safeValue === undefined) {
    return;
  }

  // since this is a controlled component, we let the parent know what to update the value to
  onChange(safeValue);
  // we also internally set the value so we can trigger an update for the other value
  setInternalValue(safeValue);
}
