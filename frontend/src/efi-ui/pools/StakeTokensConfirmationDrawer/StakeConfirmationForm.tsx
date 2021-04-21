import React, { ReactElement } from "react";

import { Callout, Divider, InputGroup } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { ConvergentCurvePoolActiveInput } from "efi-ui/pools/useConvergentCurvePoolStakeInputs/useConvergentCurvePoolStakeInputs";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

import styles from "./styles.module.css";

interface StakeConfirmationFormProps {
  activeInput: ConvergentCurvePoolActiveInput;
  assetOne: CryptoAsset | undefined;
  assetOneAmount: number | undefined;
  assetTwo: CryptoAsset | undefined;
  /**
   * If set this will override the symbol lookup for assetTwo. This is useful
   * when don't want to show a long principal or yield token symbol in the
   * input
   */
  assetTwoSymbol?: string | undefined;
  /**
   * If set this will override the symbol lookup for assetTwo. This is useful
   * when don't want to show a long principal or yield token symbol in the
   * input
   */
  assetOneSymbol?: string | undefined;
  assetTwoAmount: number | undefined;
  AssetOneIcon?: SvgIcon;
  AssetTwoIcon?: SvgIcon;
  assetOneValueLabel?: string | undefined;
  assetTwoValueLabel?: string | undefined;
  assetOneSymbolLabel?: string | undefined;
  assetTwoSymbolLabel?: string | undefined;
  heading?: string;

  /**
   * If provided, this will make the input interactive, otherwise it will be
   * disabled and read-only
   */
  onAssetOneAmountChange?: (amount: string | undefined) => void;
  /**
   * If provided, this will make the input interactive, otherwise it will be
   * disabled and read-only
   */
  onAssetTwoAmountChange?: (amount: string | undefined) => void;
  children?: ReactElement;
}

export function StakeForm({
  assetTwoSymbol: assetTwoSymbolFromProps,
  assetOneSymbol: assetOneSymbolFromProps,
  heading = t`Stake`,
  AssetOneIcon,
  AssetTwoIcon,
  assetOneValueLabel,
  assetTwoValueLabel,
  assetOneSymbolLabel,
  assetTwoSymbolLabel,
  children,
}: StakeConfirmationFormProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  return (
    <Callout className={tw("flex", "flex-col", "p-8", "space-y-6")}>
      <span className={classNames("h4", tw("text-center"))}>{heading}</span>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <div
          className={tw(
            "grid",
            "grid-cols-8",
            "place-items-stretch",
            "w-full",
            "items-center",
            "gap-2"
          )}
        >
          <span className={tw("text-base", "col-span-2")}>{t`Input #1`}</span>
          <InputGroup
            large
            fill
            placeholder="0.00"
            disabled
            className={classNames(tw("col-span-6"), styles.inputWithIcon, {
              [styles.inputColor]: !isDarkMode,
              [styles.inputColorDark]: isDarkMode,
            })}
            leftElement={
              <div className={tw("flex", "items-center", "px-2")}>
                {AssetOneIcon ? <AssetOneIcon height={18} width={18} /> : null}
              </div>
            }
            value={assetOneValueLabel}
            rightElement={
              <div className={tw("flex", "items-center", "px-3")}>
                {assetOneSymbolLabel}
              </div>
            }
          />
        </div>
        <div
          className={tw(
            "grid",
            "grid-cols-8",
            "place-items-stretch",
            "w-full",
            "items-center",
            "gap-2"
          )}
        >
          <span className={tw("text-base", "col-span-2")}>{t`Input #2`}</span>
          <InputGroup
            large
            fill
            disabled
            className={classNames(tw("col-span-6"), styles.inputWithIcon, {
              [styles.inputColor]: !isDarkMode,
              [styles.inputColorDark]: isDarkMode,
            })}
            leftElement={
              <div className={tw("flex", "items-center", "px-2")}>
                {AssetTwoIcon ? <AssetTwoIcon height={18} width={18} /> : null}
              </div>
            }
            value={assetTwoValueLabel}
            placeholder="0.00"
            rightElement={
              <div className={tw("flex", "items-center", "px-3")}>
                {assetTwoSymbolLabel}
              </div>
            }
          />
        </div>
      </div>
      <Divider />
      {children}
    </Callout>
  );
}
