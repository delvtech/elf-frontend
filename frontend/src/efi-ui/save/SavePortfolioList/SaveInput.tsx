import { ReactElement, useCallback } from "react";

import { Colors, FormGroup, InputGroup, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { validateInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import styles from "efi-ui/save/SavePortfolioList/SaveInput.module.css";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";

interface EarnInputProps {
  showMaxButton: boolean;
  // cannot be undefined as that enables 'uncontrolled' component behavior for InputGroup
  value: string;
  isValid: boolean;
  errorMessage?: string;
  onValueChange: (value: string, swapKind: SwapKind) => void;
  className?: string;

  placeholder?: string;

  assetIcon?: ReactElement;
  swapKind: SwapKind;
  valueDecimals: number | undefined;
  valueBalanceOf: BigNumber | undefined;
}

export function SaveInput(props: EarnInputProps): ReactElement {
  const {
    className,
    value,
    isValid,
    errorMessage,
    showMaxButton,
    placeholder,
    onValueChange: onChangeFromProps,
    assetIcon,
    swapKind,
    valueDecimals,
    valueBalanceOf,
  } = props;
  const { isDarkMode } = useDarkMode();

  const onChange = useOnInputChange(onChangeFromProps, valueDecimals, swapKind);

  // TODO: disable setting max value if the user balance >  pool balance.  better yet, disable max
  // value if the trade would cause too much slippage.
  // sets the max value for the input
  const setMaxValue = useSetMaxValue(
    valueBalanceOf, // the max value
    valueDecimals,
    swapKind,
    onChangeFromProps
  );

  const maxButtonElement = showMaxButton ? (
    <div className={tw("pl-1", "mr-1")}>
      <Tag
        minimal
        intent={Intent.PRIMARY}
        interactive
        onClick={setMaxValue}
      >{t`MAX`}</Tag>
    </div>
  ) : undefined;

  const helperText = isValid ? null : (
    <div
      style={{ color: isValid || Colors.RED3 }}
      className={tw("w-full", "text-right")}
    >
      {errorMessage}
    </div>
  );

  return (
    <FormGroup
      className={classNames(tw("w-full", "mb-0"), className)}
      helperText={helperText}
    >
      <InputGroup
        placeholder={placeholder}
        className={classNames(tw("w-full"), styles.investmentAmount, {
          [styles.investmentAmountLightMode]: !isDarkMode,
        })}
        value={value || ""}
        intent={isValid ? undefined : Intent.DANGER}
        leftElement={assetIcon}
        rightElement={maxButtonElement}
        onChange={onChange}
      />
    </FormGroup>
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
