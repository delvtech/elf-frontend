import React, { ChangeEvent, FC, useCallback } from "react";

import { Callout, Divider, InputGroup } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "./styles.module.css";
import { ANY_NUMBER_REGEX } from "efi/base/numbers";

interface TransactionDetailsFormProps {
  assetInIcon: SvgIcon | null;
  assetInSymbol: string | undefined;
  assetOutSymbol: string | undefined;
  amountIn: string | undefined;
  amountOut: string | undefined;

  heading?: string;

  /**
   * If provided, this will make the input interactive, otherwise it will be
   * disabled and read-only
   */
  onAmountInChange?: (amoutOut: string | undefined) => void;
  /**
   * If provided, this will make the input interactive, otherwise it will be
   * disabled and read-only
   */
  onAmountOutChange?: (amoutOut: string | undefined) => void;
  assetOutIcon: SvgIcon | null;
}
export const TransactionDetailsForm: FC<TransactionDetailsFormProps> = ({
  assetInIcon: AssetInIcon,
  assetOutIcon: AssetOutIcon,
  amountIn,
  amountOut,
  assetInSymbol,
  assetOutSymbol,
  heading = t`Confirm Transaction`,
  onAmountInChange: onAmountInChangeFromProps,
  onAmountOutChange: onAmountOutChangeFromProps,
  children,
}) => {
  const { isDarkMode } = useDarkMode();
  const onAmountInChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.value.match(ANY_NUMBER_REGEX)) {
        return;
      }
      onAmountInChangeFromProps?.(event.target.value);
    },
    [onAmountInChangeFromProps]
  );
  const onAmountOutChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.value.match(ANY_NUMBER_REGEX)) {
        return;
      }
      onAmountOutChangeFromProps?.(event.target.value);
    },
    [onAmountOutChangeFromProps]
  );
  return (
    <Callout className={tw("flex", "flex-col", "p-8", "space-y-6")}>
      <span className={classNames("h4", tw("text-center"))}>{heading}</span>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <div
          className={tw(
            "grid",
            "grid-cols-6",
            "place-items-stretch",
            "w-full",
            "items-center",
            "gap-2"
          )}
        >
          <span className={tw("text-sm", "font-semibold")}>{t`From`}</span>
          <InputGroup
            large
            fill
            placeholder="0.00"
            disabled={!onAmountInChangeFromProps}
            onChange={onAmountInChange}
            className={classNames(tw("col-span-5"), styles.inputWithIcon, {
              [styles.inputColor]: !isDarkMode,
              [styles.inputColorDark]: isDarkMode,
            })}
            leftElement={
              <div className={tw("flex", "items-center", "px-2")}>
                {AssetInIcon ? <AssetInIcon height={18} width={18} /> : null}
              </div>
            }
            value={amountIn}
            rightElement={
              <div className={tw("flex", "items-center", "px-3")}>
                {assetInSymbol}
              </div>
            }
          />
        </div>
        <div
          className={tw(
            "grid",
            "grid-cols-6",
            "place-items-stretch",
            "w-full",
            "items-center",
            "gap-2"
          )}
        >
          <span className={tw("text-sm", "font-semibold")}>{t`To`}</span>
          <InputGroup
            large
            fill
            disabled={!onAmountOutChangeFromProps}
            onChange={onAmountOutChange}
            className={classNames(tw("col-span-5"), styles.inputWithIcon, {
              [styles.inputColor]: !isDarkMode,
              [styles.inputColorDark]: isDarkMode,
            })}
            leftElement={
              <div className={tw("flex", "items-center", "px-2")}>
                {AssetOutIcon ? <AssetOutIcon height={18} width={18} /> : null}
              </div>
            }
            value={amountOut}
            placeholder="0.00"
            rightElement={
              <div className={tw("flex", "items-center", "px-3")}>
                {assetOutSymbol}
              </div>
            }
          />
        </div>
      </div>
      <Divider />
      {children}
    </Callout>
  );
};
