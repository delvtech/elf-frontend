import { ChangeEvent, ReactElement, useCallback } from "react";

import { Button, Callout, Divider, InputGroup } from "@blueprintjs/core";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

import styles from "./styles.module.css";

interface RedeemFormProps {
  tranche: Tranche | undefined;
  amount: string | undefined;
  onSetMaxAmount: () => void;

  /**
   * If set this will override the symbol lookup for assetTwo. This is useful
   * when don't want to show a long principal or yield token symbol in the
   * input
   */
  assetSymbol?: string | undefined;
  heading?: string;

  /**
   * If provided, this will make the input interactive, otherwise it will be
   * disabled and read-only
   */
  onAmountChange?: (amount: string) => void;
  children?: ReactElement;
}

export function RedeemForm({
  tranche,
  assetSymbol: assetSymbolFromProps,
  amount,
  heading = t`Redeem`,
  onAmountChange,
  onSetMaxAmount,
  children,
}: RedeemFormProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { data: assetSymbol } = useTokenSymbol(tranche);
  const assetSymbolLabel = assetSymbolFromProps || assetSymbol;
  const AssetOneIcon = findAssetIcon(assetSymbol);
  const onAssetOneAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onAmountChange?.(event.target.value);
    },
    [onAmountChange]
  );

  return (
    <Callout className={tw("flex", "flex-col", "p-8", "space-y-6")}>
      <span className={classNames("h4", tw("text-center"))}>{heading}</span>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <div className={tw("flex", "w-full", "items-center", "space-x-4")}>
          <InputGroup
            large
            fill
            placeholder="0.00"
            disabled={!onAmountChange}
            onChange={onAssetOneAmountChange}
            className={classNames(tw(), styles.inputWithIcon, {
              [styles.inputColor]: !isDarkMode,
              [styles.inputColorDark]: isDarkMode,
            })}
            leftElement={
              <div className={tw("flex", "items-center", "px-2")}>
                {AssetOneIcon ? <AssetOneIcon height={18} width={18} /> : null}
              </div>
            }
            value={amount}
            rightElement={
              <div className={tw("flex", "items-center", "px-3", "space-x-8")}>
                {assetSymbolLabel}
              </div>
            }
          />
          <Button
            className={tw("flex-shrink-0")}
            outlined
            onClick={onSetMaxAmount}
          >{t`MAX`}</Button>
        </div>
      </div>
      <Divider />
      {children}
    </Callout>
  );
}
