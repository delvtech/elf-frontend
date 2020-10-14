import React from "react";
import { Classes, IOverlayProps, MenuItem, TagInput } from "@blueprintjs/core";
import { ItemRenderer, Omnibar } from "@blueprintjs/select";
import classNames from "classnames";
import { EFI_SUPPORTED_CRYPTO_ASSETS } from "cryptoAssets";
import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";
import { FC, Fragment } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import { useCryptoAssetTagInput } from "./useCryptoAssetTagInput";
import { useCryptoAssetOmnibar } from "./useCryptoAssetOmnibar";

interface CryptoAssetSuggestProps {
  onSelect: (cryptoAsset: CryptoAssetInfo) => void;
  onRemove: (cryptoAsset: CryptoAssetInfo) => void;
  activeCryptoAsset?: CryptoAssetInfo;
  cryptoAssets?: CryptoAssetInfo[];
  className?: string;
  placeholder?: string;
  omnibarPlaceholder?: string;
}

const overlayProps: Partial<IOverlayProps> = {
  className: classNames(tw("flex", "justify-center"), Classes.DARK),
};
const omnibarClassName = tw("w-4/5", "lg:w-1/2", "left-auto");
export const CryptoAssetSuggest: FC<CryptoAssetSuggestProps> = ({
  activeCryptoAsset,
  onSelect,
  onRemove,
  cryptoAssets = EFI_SUPPORTED_CRYPTO_ASSETS,
  placeholder = t`Choose an asset`,
  omnibarPlaceholder = t`Choose an asset`,
}) => {
  const {
    isOmnibarOpen,
    closeOmnibar,
    openOmnibar,
    omnibarInputProps,
    onItemSelect,
  } = useCryptoAssetOmnibar(omnibarPlaceholder, onSelect);

  const {
    tagValues,
    tagProps,
    tagInputProps,
    onRemoveTag,
  } = useCryptoAssetTagInput(
    openOmnibar,
    placeholder,
    cryptoAssets,
    onRemove,
    activeCryptoAsset
  );

  const tagInputClassName = classNames(
    tw("w-full", "md:w-48", {
      "md:w-auto": !!tagValues.length,
    })
  );

  return (
    <Fragment>
      <TagInput
        className={tagInputClassName}
        large
        values={tagValues}
        tagProps={tagProps}
        inputProps={tagInputProps}
        onRemove={onRemoveTag}
      />
      <Omnibar<CryptoAssetInfo>
        isOpen={isOmnibarOpen}
        inputProps={omnibarInputProps}
        overlayProps={overlayProps}
        className={omnibarClassName}
        items={cryptoAssets}
        itemListPredicate={(query, items) => items}
        initialContent={undefined}
        itemRenderer={itemRenderer}
        onItemSelect={onItemSelect}
        onClose={closeOmnibar}
      />
    </Fragment>
  );
};

const itemRenderer: ItemRenderer<CryptoAssetInfo> = (
  item,
  { handleClick, modifiers: { active, disabled, matchesPredicate } }
) => {
  if (!matchesPredicate) {
    return null;
  }

  const { id, name, symbol, logoPath } = item;
  const icon = logoPath ? logoPath : undefined;
  return (
    <MenuItem
      key={id}
      active={active}
      disabled={disabled}
      className={tw("py-6", "items-center")}
      text={<span className={tw("text-lg", "px-6")}>{name}</span>}
      icon={
        <img
          src={icon}
          className={tw("h-6", "w-6")}
          alt={`${name} (${symbol})`}
        />
      }
      label={symbol}
      onClick={handleClick}
    />
  );
};
