import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button, Classes, InputGroup, Intent } from "@blueprintjs/core";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./TradeInput.module.css";

const tradeInputStyle: CSSProperties = {
  height: "96px",
  width: "100%",
  fontSize: 26,
  paddingRight: 64,
  textAlign: "right",
};

interface TradeInputProps {
  cryptoAddress: string | undefined;
  cryptoIcon: TokenIcon | undefined;
  cryptoSymbol: string | undefined;
  cryptoDecimals: number | undefined;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  previewCryptoAddress: string | undefined;
  previewCryptoPoolIndex: number | undefined;

  labelTopLeft: string;
  disabled: boolean;
  onChange: (value: string | undefined) => void;
  onPreviewUpdate: (value: string | undefined) => void;
  value: string | undefined;
  validValue: boolean;
  swapKind: SwapKind;
  pool: PoolContract | undefined;
}

export function TradeInput(props: TradeInputProps): ReactElement {
  const {
    cryptoAddress,
    cryptoSymbol,
    cryptoIcon: CryptoIcon,
    cryptoDecimals,
    cryptoBalanceOf,
    cryptoDisplayBalance,
    previewCryptoAddress,
    previewCryptoPoolIndex,
    labelTopLeft,
    disabled,
    onChange: onChangeFromProps,
    onPreviewUpdate,
    value = "",
    validValue,
    swapKind,
    pool,
  } = props;
  // changes to this will trigger calculating and calling handler to update the other value.  we
  // need to do this because the calculation is asynchronous so we can't update the preview directly
  // in the useOnInputChange handler.  Note that we use an object here to make sure we trigger
  // useUpdatePreviewValue when the string value is the same as the previous value.
  const [internalValue, setInternalValue] = useState<{
    value: string | undefined;
  }>({ value: "" });

  // handles user input changes.  call onChangeFromProps to tell the parent the value changed.  also
  // updates the internal value.  if the user clears the inputs, we also call onPreviewUpdate to
  // clear the preview.
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

  return (
    <div className={tw("flex", "flex-col", "space-y-2")}>
      <InputGroup
        disabled={disabled}
        onChange={onChange}
        placeholder={"0.00"}
        value={value}
        style={tradeInputStyle}
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
            <div
              className={tw(
                "absolute",
                "top-0",
                "left-0",
                "flex",
                "w-auto",
                "p-1",
                "space-x-2"
              )}
            >
              <span
                className={classNames(
                  Classes.TEXT_MUTED,
                  tw("text-xs", "whitespace-no-wrap")
                )}
              >
                {labelTopLeft}
              </span>
            </div>
            <div className={tw("flex", "text-2xl", "pr-4")}>
              {CryptoIcon ? <CryptoIcon height={24} width={24} /> : null}
              <span>{cryptoSymbol}</span>
            </div>
            <div
              className={tw(
                "absolute",
                "bottom-0",
                "left-0",
                "flex",
                "w-auto",
                "p-1",
                "space-x-2"
              )}
            >
              <span
                className={classNames(
                  tw("text-xs", "whitespace-no-wrap", {
                    "text-danger": !validValue,
                  }),
                  { [Classes.TEXT_MUTED]: validValue }
                )}
              >
                {t`Balance:`} {`${cryptoDisplayBalance} ${cryptoSymbol}`}
              </span>
            </div>
          </div>
        }
      />
    </div>
  );
}
function useOnInputChange(
  setInternalValue: (value: { value: string | undefined }) => void,
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
  internalValue: { value: string | undefined },
  cryptoDecimals: number | undefined,
  previewCryptoIndex: number | undefined,
  onChangeOtherValue: (value: string | undefined) => void
) {
  const tokenInAddress =
    swapKind === SwapKind.GIVEN_IN ? cryptoAddress : previewCryptoAddress;
  const tokenOutAddress =
    swapKind === SwapKind.GIVEN_OUT ? cryptoAddress : previewCryptoAddress;

  const { value } = internalValue;

  // get the preview value
  const { data: swap } = useQueryBatchSwap(
    swapKind,
    pool,
    tokenInAddress,
    tokenOutAddress,
    parseUnits(value || "0", cryptoDecimals ?? 18)
  );

  const otherValue = swap?.[previewCryptoIndex ?? 1];
  const otherStringValue = otherValue
    ? formatUnits(otherValue.abs(), cryptoDecimals)
    : undefined;

  useEffect(() => {
    // let parent know preview value updated
    onChangeOtherValue(otherStringValue);
  }, [internalValue, onChangeOtherValue, otherStringValue]);
}

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  tokenDecimals: number | undefined,
  setInternalValue: (value: { value: string | undefined }) => void,
  onChange: (value: string | undefined) => void
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      setInternalValue({ value: maxValue });
      onChange(maxValue);
    }
  }, [tokenBalanceOf, tokenDecimals, setInternalValue, onChange]);
}

function validateAndSetValue(
  value: string,
  setInternalValue: (value: { value: string }) => void,
  onChange: (value: string | undefined) => void,
  updatePreviewValue: (value: string | undefined) => void,
  cryptoDecimals: number | undefined
) {
  // allow user to clear input
  if (value === "") {
    setInternalValue({ value: "" });
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
  setInternalValue({ value: safeValue });
}
