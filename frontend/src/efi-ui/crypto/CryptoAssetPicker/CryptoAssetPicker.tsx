import React, { ReactElement } from "react";

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
  cryptoAssets: (CryptoAssetWithIcon | undefined)[];
  activeCryptoAsset: CryptoAssetWithIcon | undefined;
  onCryptoAssetChange: (newCryptoAsset: CryptoAssetWithIcon) => void;
}

export function CryptoAssetPicker({
  className,
  cryptoAssets,
  onCryptoAssetChange,
  activeCryptoAsset,
}: CryptoAssetPickerProps): ReactElement {
  const availableCryptoAssets = cryptoAssets.filter(
    (cryptoAsset): cryptoAsset is CryptoAssetWithIcon => !!cryptoAsset
  );

  if (!activeCryptoAsset || !availableCryptoAssets.length) {
    return <span>{t`Could not find any base assets`}</span>;
  }

  return (
    <Select
      className={classNames(tw("flex-shrink-0"), className)}
      popoverProps={{
        minimal: true,
        popoverClassName: classNames(styles.baseAssetPicker),
      }}
      items={availableCryptoAssets}
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
}
