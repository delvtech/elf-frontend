import { HTMLInputProps, IInputGroupProps } from "@blueprintjs/core";
import { useCallback, useMemo } from "react";

import { useBoolean } from "efi-ui/base/hooks/useBoolean/useBoolean";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";

interface CryptoAssetOmnibar {
  isOmnibarOpen: boolean;
  openOmnibar: () => void;
  closeOmnibar: () => void;
  omnibarInputProps: IInputGroupProps & HTMLInputProps;
  onItemSelect: (cryptoAsset: CryptoAssetInfo) => void;
}

export function useCryptoAssetOmnibar(
  omnibarPlaceholder: string,
  onSelect: (cryptoAsset: CryptoAssetInfo) => void
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
    (cryptoAsset: CryptoAssetInfo) => {
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
