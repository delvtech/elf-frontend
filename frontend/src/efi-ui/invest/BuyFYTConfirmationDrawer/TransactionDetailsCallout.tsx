import React, { FC } from "react";

import { Callout, Icon, InputGroup, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { AssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "./styles.module.css";

interface TransactionDetailsCalloutProps {
  assetInIcon: AssetIcon;
  amountIn: string | undefined;
  amountOut: string | undefined;
  assetOutIcon: AssetIcon | null;
}
export const TransactionDetailsCallout: FC<TransactionDetailsCalloutProps> = ({
  assetInIcon: AssetInIcon,
  assetOutIcon: AssetOutIcon,
  amountIn,
  amountOut,
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <Callout className={tw("p-4")}>
      <div className={tw("flex", "flex-col", "space-y-4", "items-center")}>
        <span className="h4">{t`Confirm transaction`}</span>
        <div
          style={{
            backgroundColor: isDarkMode
              ? "var(--bp3-dark-bg-color)"
              : "var(--bp3-bg-color)",
          }}
          className={tw("flex", "space-x-1", "h-24", "rounded")}
        >
          <div className={tw("flex", "items-center", "px-2")}>
            <AssetInIcon height={18} width={18} />
          </div>
          <span>{amountIn}</span>
        </div>
      </div>
      <Icon icon={IconNames.ARROW_DOWN} />
      <InputGroup
        large
        fill
        disabled
        className={classNames(styles.inputWithIcon)}
        leftElement={
          <div className={tw("flex", "items-center", "px-2")}>
            {AssetOutIcon ? <AssetOutIcon height={18} width={18} /> : null}
          </div>
        }
        value={amountOut}
        rightElement={<Tag minimal>{"Principal Token"}</Tag>}
      />
    </Callout>
  );
};
