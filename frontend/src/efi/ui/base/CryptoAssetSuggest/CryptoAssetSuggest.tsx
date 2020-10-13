import {
  Classes,
  HTMLInputProps,
  IInputGroupProps,
  IOverlayProps,
  MenuItem,
  TagInput,
} from "@blueprintjs/core";
import { ItemRenderer, Omnibar } from "@blueprintjs/select";
import classNames from "classnames";
import { EFI_SUPPORTED_CRYPTO_ASSETS } from "cryptoAssets";
import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";
import React, { FC, Fragment, useCallback, useMemo, useState } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface CryptoAssetSuggestProps {
  onCryptoAssetSelect: (cryptoAsset: CryptoAssetInfo) => void;
  activeCryptoAsset?: CryptoAssetInfo;
  cryptoAssets?: CryptoAssetInfo[];
  className?: string;

  placeholder?: string;
  omnibarPlaceholder?: string;
}

const overlayProps: Partial<IOverlayProps> = {
  className: classNames(tw("flex", "justify-center"), Classes.DARK),
};
export const CryptoAssetSuggest: FC<CryptoAssetSuggestProps> = ({
  activeCryptoAsset,
  onCryptoAssetSelect = () => {},
  cryptoAssets = EFI_SUPPORTED_CRYPTO_ASSETS,
  placeholder = t`Choose an asset`,
  omnibarPlaceholder = t`Choose an asset`,
  className,
}) => {
  const {
    isOpen: isOmnibarOpen,
    open: openOmnibar,
    close: closeOmnibar,
  } = useOmnibar();

  const tagInputProps: IInputGroupProps & HTMLInputProps = useMemo(() => {
    return {
      large: true,
      placeholder,
      onClick: openOmnibar,
    };
  }, [openOmnibar, placeholder]);

  const omnibarInputProps: IInputGroupProps & HTMLInputProps = useMemo(() => {
    return {
      large: true,
      placeholder: omnibarPlaceholder,
    };
  }, [omnibarPlaceholder]);

  return (
    <Fragment>
      <TagInput
        large
        values={[activeCryptoAsset]}
        inputProps={tagInputProps}
        className={tw("w-full", "md:w-48")}
      />
      <Omnibar<CryptoAssetInfo>
        isOpen={isOmnibarOpen}
        inputProps={omnibarInputProps}
        overlayProps={overlayProps}
        className={tw("w-4/5", "lg:w-1/2", "left-auto")}
        items={cryptoAssets}
        itemRenderer={itemRenderer}
        onItemSelect={() => {}}
        onClose={closeOmnibar}
      />
    </Fragment>
  );
};

function useOmnibar() {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return { isOpen, open, close };
}

const itemRenderer: ItemRenderer<CryptoAssetInfo> = ({
  id,
  name,
  symbol,
  logoPath,
}) => {
  const icon = logoPath ? logoPath : undefined;
  return (
    <MenuItem
      key={id}
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
    />
  );
};
