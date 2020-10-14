import { HTMLInputProps, IInputGroupProps } from "@blueprintjs/core";
import { CryptoAssetInfo } from "efi/base/CryptoAssetInfo";
import { useBoolean } from "efi/ui/base/useBoolean/useBoolean";
import { useCallback, useMemo } from "react";

export function useCryptoAssetOmnibar(
  omnibarPlaceholder: string,
  onSelect: (cryptoAsset: CryptoAssetInfo) => void
) {
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

  const onActiveItemChange = useCallback(
    (activeItem: CryptoAssetInfo | null) => {
      if (activeItem) {
        onSelect(activeItem);
      }
    },
    [onSelect]
  );

  return {
    isOmnibarOpen,
    openOmnibar,
    closeOmnibar,
    omnibarInputProps,
    onItemSelect,
    onActiveItemChange,
  };
}
