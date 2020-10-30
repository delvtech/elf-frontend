import React, { ReactNode, useCallback, useMemo } from "react";

import {
  HTMLInputProps,
  IInputGroupProps,
  Intent,
  ITagProps,
} from "@blueprintjs/core";
import tw from "efi-tailwindcss-classnames";

import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";

interface CryptoAssetTagInput {
  tagInputProps: IInputGroupProps & HTMLInputProps;
  onRemoveTag: (value: ReactNode, index: number) => void;
  tagValues: ReactNode[];
  tagProps: (value: ReactNode) => ITagProps;
}

export function useCryptoAssetTagInput(
  openOmnibar: () => void,
  initialPlaceholder: string,
  cryptoAssets: CryptoAssetInfo[],
  onRemove: (cryptoAsset: CryptoAssetInfo) => void,
  activeCryptoAsset: CryptoAssetInfo | undefined
): CryptoAssetTagInput {
  const onTagInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // non-alphanumeric characters like Escape, Tab, Shift should not trigger
      // the omnibar
      if (event.key.length === 1 || event.key === "Enter") {
        openOmnibar();
      }
    },
    [openOmnibar]
  );

  const tagInputProps: IInputGroupProps & HTMLInputProps = useMemo(() => {
    const placeholder = activeCryptoAsset ? undefined : initialPlaceholder;
    const props: IInputGroupProps & HTMLInputProps = {
      large: true,
      placeholder,
      onClick: openOmnibar,
      onKeyDown: onTagInputKeyDown,
    };
    return props;
  }, [activeCryptoAsset, initialPlaceholder, openOmnibar, onTagInputKeyDown]);

  const cryptoAssetsByName: Record<string, CryptoAssetInfo> = useMemo(() => {
    const result: Record<string, CryptoAssetInfo> = {};
    cryptoAssets.forEach((cryptoAsset) => {
      result[cryptoAsset.name] = cryptoAsset;
    });
    return result;
  }, [cryptoAssets]);

  const onRemoveTag = useCallback(
    (value: ReactNode, index: number) => {
      const assetToRemove =
        cryptoAssetsByName[
          // it's safe to cast this as a string, because we control the tagValue type.
          value as string
        ];
      onRemove(assetToRemove);
    },

    [cryptoAssetsByName, onRemove]
  );

  const tagValues: ReactNode[] = useMemo(() => {
    const values: ReactNode[] = [];

    if (activeCryptoAsset?.name) {
      // Currently only one tag is shown at a time
      values.push(activeCryptoAsset.name);
    }

    return values;
  }, [activeCryptoAsset]);

  const tagProps = useCallback(
    (value: ReactNode): ITagProps => {
      const { name, symbol, logoImgSrc } = cryptoAssetsByName[
        // it's safe to cast this as a string, because we control the tagValue type.
        value as string
      ];
      const props: ITagProps = {
        intent: Intent.PRIMARY,
        interactive: true,
        minimal: true,
        icon: (
          <img
            src={logoImgSrc}
            className={tw("h-6", "w-6")}
            alt={`${name} (${symbol})`}
          />
        ),
      };
      return props;
    },
    [cryptoAssetsByName]
  );

  return { tagInputProps, onRemoveTag, tagValues, tagProps };
}
