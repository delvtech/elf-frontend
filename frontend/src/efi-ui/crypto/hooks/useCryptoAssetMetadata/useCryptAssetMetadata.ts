import { CryptoAssetMetadata } from "efi-ui/crypto/CryptoAssetMetadata";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetMetadata(
  asset: CryptoAsset | undefined
): CryptoAssetMetadata {
  const name = useCryptoName(asset);
  const symbol = useCryptoSymbol(asset);
  const decimals = useCryptoDecimals(asset);
  const icon = findAssetIcon(symbol);

  const metadata: CryptoAssetMetadata = {
    name,
    symbol,
    decimals,
    icon,
  };

  return metadata;
}
