import { CryptoAssetMetadata } from "efi-ui/crypto/CryptoAssetMetadata";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { getCryptoName } from "efi/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/getCryptoSymbol";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetMetadata(
  asset: CryptoAsset | undefined
): CryptoAssetMetadata {
  const name = getCryptoName(asset);
  const symbol = getCryptoSymbol(asset);
  const decimals = useCryptoDecimals(asset);
  const icon = findAssetIcon2(asset);

  const metadata: CryptoAssetMetadata = {
    name,
    symbol,
    decimals,
    icon,
  };

  return metadata;
}
