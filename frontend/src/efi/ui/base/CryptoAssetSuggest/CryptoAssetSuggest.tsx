import {
  HTMLInputProps,
  IInputGroupProps,
  IPopoverProps,
  MenuItem,
} from "@blueprintjs/core";
import { ItemRenderer, Suggest } from "@blueprintjs/select";
import { EFI_SUPPORTED_CRYPTO_ASSETS } from "cryptoAssets";
import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";
import React, { FC } from "react";
import { t } from "ttag";

interface CryptoAssetSuggestProps {
  cryptoAssets?: CryptoAssetInfo[];
  className?: string;

  placeholder?: string;
}

const popoverProps: Partial<IPopoverProps> = { minimal: true };
export const CryptoAssetSuggest: FC<CryptoAssetSuggestProps> = ({
  cryptoAssets = EFI_SUPPORTED_CRYPTO_ASSETS,
  placeholder = t`Choose an asset`,
  className,
}) => {
  const inputProps: IInputGroupProps & HTMLInputProps = {
    large: true,
    placeholder,
  };

  return (
    <Suggest
      inputProps={inputProps}
      className={className}
      popoverProps={popoverProps}
      items={cryptoAssets}
      itemRenderer={itemRenderer}
      inputValueRenderer={({ name }) => name}
      onItemSelect={() => {}}
    />
  );
};

const itemRenderer: ItemRenderer<CryptoAssetInfo> = ({
  id,
  name,
  symbol,
  logoPath,
}) => {
  return <MenuItem text={name} />;
};
