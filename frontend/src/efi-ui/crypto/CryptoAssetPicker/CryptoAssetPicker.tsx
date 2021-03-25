import React, { FC } from "react";

import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import styles from "efi-ui/crypto/CryptoAssetPicker/styles.module.css";

import { CryptoAssetButton } from "./CryptoAssetButton";

interface CryptoAssetPickerProps {
  className?: string;
  cryptoAssets: CryptoAssetWithIcon[];
  activeCryptoAsset: CryptoAssetWithIcon;
  onCryptoAssetChange: (newCryptoAsset: CryptoAssetWithIcon) => void;
}
export const CryptoAssetPicker: FC<CryptoAssetPickerProps> = ({
  className,
  cryptoAssets,
  onCryptoAssetChange,
  activeCryptoAsset,
}) => {
  // This should never happen, and is only here for typesafety
  if (!activeCryptoAsset) {
    return <span>{t`Could not find any base assets`}</span>;
  }

  return (
    <Select
      className={classNames(tw("flex-shrink-0"), className)}
      popoverProps={{
        minimal: true,
        popoverClassName: classNames(styles.baseAssetPicker),
      }}
      items={cryptoAssets}
      filterable={false}
      itemRenderer={(baseAsset, { handleClick }) => (
        <CryptoAssetButton
          key={baseAsset.id}
          fill
          minimal
          onClick={handleClick}
          cryptoAsset={baseAsset}
        />
      )}
      onItemSelect={onCryptoAssetChange}
    >
      <CryptoAssetButton
        minimal
        cryptoAsset={activeCryptoAsset}
        rightIcon={IconNames.CARET_DOWN}
      />
    </Select>
  );
};
