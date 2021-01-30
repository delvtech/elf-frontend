import { IOverlayProps, MenuItem, TagInput } from "@blueprintjs/core";
import { ItemListPredicate, ItemRenderer, Omnibar } from "@blueprintjs/select";
import classNames from "classnames";
import { filter } from "fuzzaldrin-plus";
import React, { FC, Fragment } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EFI_SUPPORTED_CRYPTO_ASSETS } from "efi-ui/graveyard/cryptoAssets";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { CryptoAssetInfoOld } from "efi/graveyard/CryptoAssetInfo";

import { CryptoAssetSuggestItem } from "./CryptoAssetSuggestItem";
import { useCryptoAssetOmnibar } from "./useCryptoAssetOmnibar";
import { useCryptoAssetTagInput } from "./useCryptoAssetTagInput";

interface CryptoAssetSuggestProps {
  onSelect: (cryptoAsset: CryptoAssetInfoOld) => void;
  onRemove: (cryptoAsset: CryptoAssetInfoOld) => void;
  activeCryptoAsset?: CryptoAssetInfoOld;
  cryptoAssets?: CryptoAssetInfoOld[];
  className?: string;
  placeholder?: string;
  omnibarPlaceholder?: string;
}

const omnibarClassName = tw("w-4/5", "md:w-2/3", "lg:w-1/2", "left-auto");
export const CryptoAssetSuggest: FC<CryptoAssetSuggestProps> = ({
  activeCryptoAsset,
  onSelect,
  onRemove,
  cryptoAssets = EFI_SUPPORTED_CRYPTO_ASSETS,
  placeholder = t`Choose an asset`,
  omnibarPlaceholder = t`Choose an asset`,
}) => {
  const { darkModeClassName } = useDarkMode();

  const overlayProps: Partial<IOverlayProps> = {
    className: classNames(darkModeClassName, tw("flex", "justify-center")),
  };

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
      <Omnibar<CryptoAssetInfoOld>
        isOpen={isOmnibarOpen}
        inputProps={omnibarInputProps}
        overlayProps={overlayProps}
        className={omnibarClassName}
        items={cryptoAssets}
        itemListPredicate={itemListPredicate}
        itemRenderer={itemRenderer}
        onItemSelect={onItemSelect}
        onClose={closeOmnibar}
      />
    </Fragment>
  );
};

const itemRenderer: ItemRenderer<CryptoAssetInfoOld> = (
  item,
  { handleClick, modifiers: { active, disabled, matchesPredicate } }
) => {
  if (!matchesPredicate) {
    return null;
  }

  const { name, symbol, logoImgSrc } = item;

  return (
    <MenuItem
      key={symbol}
      active={active}
      disabled={disabled}
      multiline
      className={tw("py-6", "items-center")}
      text={<CryptoAssetSuggestItem cryptoAsset={item} />}
      icon={
        <div
          className={tw("flex", "flex-col", "items-center", "gap-1", "pr-6")}
        >
          <img
            src={logoImgSrc}
            className={tw("h-6", "w-6")}
            alt={`${name} (${symbol})`}
          />
          <span className={tw("text-xs", "font-bold")}>{symbol}</span>
        </div>
      }
      onClick={handleClick}
    />
  );
};

const itemListPredicate: ItemListPredicate<CryptoAssetInfoOld> = (
  query,
  items
) => {
  if (!query) {
    return items;
  }

  return filter(items, query, {
    allowErrors: true,
    key: "name",
    maxResults: 10,
    pathSeparator: "/",
    usePathScoring: true,
  });
};
