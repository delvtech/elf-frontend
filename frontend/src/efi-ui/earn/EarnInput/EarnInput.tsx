import { ChangeEvent, ReactElement, useCallback } from "react";

import { InputGroup, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/earn/EarnInput/EarnInput.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ANY_NUMBER_REGEX } from "efi/base/numbers";

interface EarnInputProps {
  showMaxButton: boolean;
  assetBalance: number;
  value: string | undefined;
  onValueChange: (newValue: string) => void;
  className?: string;

  placeholder?: string;

  assetPicker: ReactElement;
}

export function EarnInput({
  className,
  value,
  showMaxButton,
  placeholder,
  assetBalance,
  onValueChange,
  assetPicker,
}: EarnInputProps): ReactElement {
  const { isDarkMode } = useDarkMode();

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
      value={inputValue}
      large
      leftElement={assetPicker}
      rightElement={maxButtonElement}
      onChange={onChange}
    />
  );
}
