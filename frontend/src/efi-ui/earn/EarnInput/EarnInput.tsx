import { CSSProperties, ReactElement, useCallback } from "react";

import { InputGroup, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { getPlacesAfterDecimal } from "efi/math/fixedPoint";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import styles from "efi-ui/earn/EarnInput/EarnInput.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";

interface EarnInputProps {
  showMaxButton: boolean;
  // cannot be undefined as that enables 'uncontrolled' component behavior for InputGroup
  value: string;
  validValue: boolean;
  onValueChange: (value: string, swapKind: SwapKind) => void;
  className?: string;

  placeholder?: string;

  assetPicker: ReactElement;
  swapKind: SwapKind;
  cryptoDecimals: number | undefined;
  cryptoBalanceOf: BigNumber | undefined;
}

const earnInputStyle: CSSProperties = {
  height: "94px",
  width: "100%",
  fontSize: 26,
};
export function EarnInput({
  className,
  value,
  validValue,
  showMaxButton,
  placeholder,
  onValueChange: onChangeFromProps,
  assetPicker,
  swapKind,
  cryptoDecimals,
  cryptoBalanceOf,
}: EarnInputProps): ReactElement {
  const { isDarkMode } = useDarkMode();

  const onChange = useOnInputChange(
    onChangeFromProps,
    cryptoDecimals,
    swapKind
  );

  // TODO: disable setting max value if the user balance >  pool balance.  better yet, disable max
  // value if the trade would cause too much slippage.
  // sets the max value for the input
  const setMaxValue = useSetMaxValue(
    cryptoBalanceOf, // the max value
    cryptoDecimals,
    swapKind,
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
      style={earnInputStyle}
      className={classNames(
        tw("w-full"),
        styles.investmentAmount,
        { [styles.investmentAmountLightMode]: !isDarkMode },
        className
      )}
      value={value || ""}
      intent={validValue ? undefined : Intent.DANGER}
      large
      leftElement={assetPicker}
      rightElement={maxButtonElement}
      onChange={onChange}
    />
  );
}

function useOnInputChange(
  onChange: (value: string, swapKind: SwapKind) => void,
  cryptoDecimals: number | undefined,
  swapKind: SwapKind
) {
  return useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const userInputValue = event.target.value;
      // checks for valid values before reporting to parent
      validateAndSetValue(userInputValue, onChange, cryptoDecimals, swapKind);
    },
    [onChange, cryptoDecimals, swapKind]
  );
}

function useSetMaxValue(
  tokenBalanceOf: BigNumber | undefined,
  tokenDecimals: number | undefined,
  swapKind: SwapKind,
  onChange: (value: string, swapKind: SwapKind) => void
) {
  return useCallback(() => {
    if (tokenBalanceOf) {
      const maxValue = formatUnits(tokenBalanceOf, tokenDecimals);
      onChange(maxValue, swapKind);
    }
  }, [tokenBalanceOf, tokenDecimals, onChange, swapKind]);
}

function validateAndSetValue(
  value: string,
  onChange: (value: string, swapKind: SwapKind) => void,
  cryptoDecimals: number | undefined,
  swapKind: SwapKind
) {
  // allow user to clear input
  if (value === "" || value === undefined) {
    onChange("", swapKind);
    return;
  }

  // get safe value by handling edge cases and clipping decimals
  const safeValue = clipStringValueToDecimals(value, cryptoDecimals || 18);

  // if value is not undefiend, then check if its invalid.  if so, we want to ignore the user's input
  if (!validateInput(safeValue) || safeValue === undefined) {
    return;
  }

  // since this is a controlled component, we let the parent know what to update the value to
  onChange(safeValue, swapKind);
}
