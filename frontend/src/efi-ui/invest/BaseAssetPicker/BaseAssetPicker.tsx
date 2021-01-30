import React, { FC } from "react";

import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";

import { BaseAssetButton } from "./BaseAssetButton";

interface BaseAssetPickerProps {
  className?: string;
  baseAssets: CryptoAssetWithIcon[];
  activeBaseAsset: CryptoAssetWithIcon;
  onBaseAssetChange: (newBaseAsset: CryptoAssetWithIcon) => void;
}
export const BaseAssetPicker: FC<BaseAssetPickerProps> = ({
  className,
  baseAssets,
  onBaseAssetChange,
  activeBaseAsset,
}) => {
  // This should never happen, and is only here for typesafety
  if (!activeBaseAsset) {
    return <span>{t`Could not find any base assets`}</span>;
  }

  return (
    <Select
      className={classNames(tw("w-64", "flex-shrink-0"), className)}
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={baseAssets}
      filterable={false}
      itemRenderer={(baseAsset, { handleClick }) => (
        <BaseAssetButton
          fill
          minimal
          onClick={handleClick}
          baseAsset={baseAsset}
        />
      )}
      onItemSelect={onBaseAssetChange}
    >
      <BaseAssetButton
        minimal
        baseAsset={activeBaseAsset}
        rightIcon={IconNames.CARET_DOWN}
      />
    </Select>
  );
};
