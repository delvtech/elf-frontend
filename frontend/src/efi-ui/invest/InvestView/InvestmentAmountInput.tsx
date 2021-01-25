import { ChangeEvent, FC, ReactElement, useCallback } from "react";
import { InputGroup, Tag } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import classNames from "classnames";

import styles from "efi-ui/invest/InvestView/styles.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

const ANY_NUMBER_REGEX = /^\d*\.?\d*$/;
interface InvestmentAmountInputProps {
  assetBalance: number;
  value: string | undefined;
  onValueChange: (newValue: string) => void;
  className?: string;

  placeholder?: string;

  baseAssetPicker: ReactElement;
}

export const InvestmentAmountInput: FC<InvestmentAmountInputProps> = ({
  className,
  value,
  placeholder,
  assetBalance,
  onValueChange,
  baseAssetPicker,
}) => {
  const { isDarkMode } = useDarkMode();
  const setMaxAmount = useCallback(() => {
    onValueChange(`${assetBalance}`);
  }, [assetBalance, onValueChange]);

  return (
    <InputGroup
      placeholder={placeholder}
      style={{ height: "100%", width: "100%", fontSize: 26 }}
      className={classNames(
        styles.investmentAmount,
        { [styles.investmentAmountLightMode]: !isDarkMode },
        className
      )}
      value={value}
      large
      leftElement={baseAssetPicker}
      rightElement={
        <div className={tw("px-4")}>
          <Tag minimal interactive onClick={setMaxAmount}>{t`MAX`}</Tag>
        </div>
      }
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.match(ANY_NUMBER_REGEX)) {
          onValueChange(event.target.value);
        }
      }}
    />
  );
};
