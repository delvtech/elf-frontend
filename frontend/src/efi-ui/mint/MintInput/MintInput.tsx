import React, { CSSProperties, ReactElement, useCallback } from "react";

import { Button, InputGroup, Intent } from "@blueprintjs/core";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";

import styles from "./MintInput.module.css";

const mintInputStyle: CSSProperties = {
  height: "45px",
  width: "100%",
  fontSize: 18,
  paddingRight: 64,
  textAlign: "right",
};

interface MintInputProps {
  cryptoIcon: TokenIcon | undefined;
  cryptoSymbol: string | undefined;
  cryptoDecimals: number | undefined;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  disabled: boolean;
  onChange: (value: string) => void;
  onPreviewUpdate: (value: string | undefined) => void;
  value: string | undefined;
  validValue: boolean;
}

export function MintInput(props: MintInputProps): ReactElement {
  const {
    cryptoSymbol,
    cryptoIcon: CryptoIcon,
    cryptoDecimals,
    cryptoBalanceOf,
    cryptoDisplayBalance,
    disabled,
    onChange: onChangeFromProps,
    value = "",
    validValue,
    onPreviewUpdate,
  } = props;

  // handles user input changes.  call onChangeFromProps to tell the parent the value changed.  also
  // updates the internal value.  if the user clears the inputs, we also call onPreviewUpdate to
  // clear the preview.
  const onChange = useOnInputChange(
    onChangeFromProps,
    onPreviewUpdate,
    cryptoDecimals
  );

  // TODO: disable setting max value if the user balance >  pool balance.  better yet, disable max
  // value if the trade would cause too much slippage.

  // sets the max value for the input
  const setMaxValue = useSetMaxValue(
    cryptoBalanceOf, // the max value
    cryptoDecimals,
    onChangeFromProps
  );

  return (
    <div className={tw("flex", "flex-col", "space-y-2")}>
      <div className={tw("-mb-1")}>Available: {cryptoDisplayBalance}</div>
      <InputGroup
        disabled={disabled}
        onChange={onChange}
        placeholder={"0.00"}
        value={value}
        style={mintInputStyle}
        className={classNames(styles.depositInput, tw("text-right"))}
        large
        intent={validValue ? undefined : Intent.DANGER}
        rightElement={
          <div
            className={tw(
              "h-full",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "relative"
            )}
          >
            <Button disabled={disabled} onClick={setMaxValue} large>
              {t`MAX`}
            </Button>
          </div>
        }
        leftElement={
          <div
            className={tw(
              "h-full",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "relative"
            )}
          >
            <div className={tw("flex", "text-lg", "pr-4")}>
              {CryptoIcon ? <CryptoIcon height={24} width={24} /> : null}
              <span>{cryptoSymbol}</span>
            </div>
          </div>
        }
      />
    </div>
  );
}

function useOnInputChange(
  onChange: (value: string) => void,
  onPreviewUpdate: (value: string | undefined) => void,
  cryptoDecimals: number | undefined
) {
  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const userInputValue = event.target.value;

      // sets internal value
      validateAndSetValue(
        userInputValue,
        onChange,
        onPreviewUpdate,
        cryptoDecimals
      );
    },
    [onChange, onPreviewUpdate, cryptoDecimals]
  );
}

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  tokenDecimals: number | undefined,
  onChange: (value: string) => void
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      onChange(maxValue);
    }
  }, [tokenBalanceOf, tokenDecimals, onChange]);
}

function validateAndSetValue(
  value: string,
  onChange: (value: string) => void,
  updatePreviewValue: (value: string | undefined) => void,
  cryptoDecimals: number | undefined
) {
  // allow user to clear input
  if (value === "") {
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
}
