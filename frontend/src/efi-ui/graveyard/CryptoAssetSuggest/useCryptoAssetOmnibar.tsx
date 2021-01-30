import { HTMLInputProps, IInputGroupProps } from "@blueprintjs/core";
import { useCallback, useMemo } from "react";

import { useBoolean } from "efi-ui/base/hooks/useBoolean/useBoolean";
import { CryptoAssetInfoOld } from "efi/graveyard/CryptoAssetInfo";

interface CryptoAssetOmnibar {
  isOmnibarOpen: boolean;
  openOmnibar: () => void;
  closeOmnibar: () => void;
  omnibarInputProps: IInputGroupProps & HTMLInputProps;
  onItemSelect: (cryptoAsset: CryptoAssetInfoOld) => void;
}

export function useCryptoAssetOmnibar(
  omnibarPlaceholder: string,
  onSelect: (cryptoAsset: CryptoAssetInfoOld) => void
): CryptoAssetOmnibar {
  const {
    value: isOmnibarOpen,
    setTrue: openOmnibar,
    setFalse: closeOmnibar,
  } = useBoolean();

  const omnibarInputProps: IInputGroupProps & HTMLInputProps = useMemo(() => {
    return {
      large: true,
      placeholder: omnibarPlaceholder,
    };
  }, [omnibarPlaceholder]);

  const onItemSelect = useCallback(
    (cryptoAsset: CryptoAssetInfoOld) => {
      onSelect(cryptoAsset);
      closeOmnibar();
    },
    [closeOmnibar, onSelect]
  );

  return {
    isOmnibarOpen,
    openOmnibar,
    closeOmnibar,
    omnibarInputProps,
    onItemSelect,
  };
}
