import { ChangeEvent, FC, ReactElement, useCallback } from "react";

import { InputGroup, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/earn/EarnInput/EarnInput.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ANY_NUMBER_REGEX } from "../../../efi/base/numbers";

interface EarnInputProps {
  showMaxButton: boolean;
  assetBalance: number;
  value: string | undefined;
  onValueChange: (newValue: string) => void;
  className?: string;

  placeholder?: string;

  assetPicker: ReactElement;
}

export const EarnInput: FC<EarnInputProps> = ({
  className,
  value,
  showMaxButton,
  placeholder,
  assetBalance,
  onValueChange,
  assetPicker,
}) => {
  const { isDarkMode } = useDarkMode();

  const setMaxAmount = useCallback(() => {
    onValueChange(`${assetBalance}`);
  }, [assetBalance, onValueChange]);

  const maxButtonElement = showMaxButton ? (
    <div className={tw("px-4")}>
      <Tag minimal interactive onClick={setMaxAmount}>{t`MAX`}</Tag>
    </div>
  ) : undefined;

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.value.match(ANY_NUMBER_REGEX)) {
        return;
      }
      onValueChange(event.target.value);
    },
    [onValueChange]
  );

  // We want InputGroup to be a controlled component, but passing `undefined` is
  // how you express an uncontrolled component. Having this change between
  // uncontrolled and controlled causes bugginess and big warnings in the
  // console, so we use empty string here to keep everything controlled.
  const inputValue = value === undefined ? "" : value;

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
};
