import React, { FC } from "react";

import { Callout, Divider, Icon, InputGroup, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { AssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "./styles.module.css";

interface TransactionDetailsPreviewProps {
  assetInIcon: AssetIcon;
  assetInSymbol: string | undefined;
  assetOutSymbol: string | undefined;
  amountIn: string | undefined;
  amountOut: string | undefined;
  assetOutIcon: AssetIcon | null;
}
export const TransactionDetailsPreview: FC<TransactionDetailsPreviewProps> = ({
  assetInIcon: AssetInIcon,
  assetOutIcon: AssetOutIcon,
  amountIn,
  amountOut,
  assetInSymbol,
  assetOutSymbol,
  children,
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <Callout className={tw("flex", "flex-col", "p-8", "space-y-6")}>
      <span
        className={classNames("h4", tw("text-center"))}
      >{t`Confirm Transaction`}</span>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <InputGroup
          large
          fill
          disabled
          className={classNames(styles.inputWithIcon, {
            [styles.inputColor]: !isDarkMode,
            [styles.inputColorDark]: isDarkMode,
          })}
          leftElement={
            <div className={tw("flex", "items-center", "px-2")}>
              {AssetInIcon ? <AssetInIcon height={18} width={18} /> : null}
            </div>
          }
          value={amountIn}
          rightElement={<Tag minimal>{assetInSymbol}</Tag>}
        />
        <Icon icon={IconNames.ARROW_DOWN} />
        <InputGroup
          large
          fill
          disabled
          className={classNames(styles.inputWithIcon, {
            [styles.inputColor]: !isDarkMode,
            [styles.inputColorDark]: isDarkMode,
          })}
          leftElement={
            <div className={tw("flex", "items-center", "px-2")}>
              {AssetOutIcon ? <AssetOutIcon height={18} width={18} /> : null}
            </div>
          }
          value={amountOut}
          rightElement={<Tag minimal>{assetOutSymbol}</Tag>}
        />
      </div>
      <Divider />
      {children}
    </Callout>
  );
};
