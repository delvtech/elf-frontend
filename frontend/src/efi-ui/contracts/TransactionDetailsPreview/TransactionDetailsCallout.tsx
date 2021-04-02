import React, { FC } from "react";

import { Callout, Divider, InputGroup, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SvgIcon } from "efi-ui/base/SvgIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "./styles.module.css";

interface TransactionDetailsPreviewProps {
  assetInIcon: SvgIcon;
  assetInSymbol: string | undefined;
  assetOutSymbol: string | undefined;
  amountIn: string | undefined;
  amountOut: string | undefined;
  assetOutIcon: SvgIcon | null;
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
            disabled
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
            rightElement={<Tag minimal>{assetInSymbol}</Tag>}
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
            disabled
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
            rightElement={<Tag minimal>{assetOutSymbol}</Tag>}
          />
        </div>
      </div>
      <Divider />
      {children}
    </Callout>
  );
};
