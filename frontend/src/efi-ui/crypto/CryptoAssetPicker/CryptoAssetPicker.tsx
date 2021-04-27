import React, { ReactElement } from "react";

import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/crypto/CryptoAssetPicker/styles.module.css";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

import { CryptoAssetButton } from "./CryptoAssetButton";

interface CryptoAssetPickerProps {
  className?: string;
  cryptoAssets: (CryptoAsset | undefined)[];
  activeCryptoAsset: CryptoAsset | undefined;
  onCryptoAssetChange: (newCryptoAsset: CryptoAsset) => void;
}

export function CryptoAssetPicker({
  className,
  cryptoAssets,
  onCryptoAssetChange,
  activeCryptoAsset,
}: CryptoAssetPickerProps): ReactElement {
  const availableCryptoAssets = cryptoAssets.filter(
    (cryptoAsset): cryptoAsset is CryptoAsset => !!cryptoAsset
  );

  if (!activeCryptoAsset || !availableCryptoAssets.length) {
    return (
      <CryptoAssetButton
        minimal
        loading
        cryptoAsset={activeCryptoAsset}
        rightIcon={IconNames.CARET_DOWN}
      />
    );
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
