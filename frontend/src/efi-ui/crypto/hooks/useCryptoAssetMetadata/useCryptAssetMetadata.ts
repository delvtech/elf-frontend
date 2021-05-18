import { CryptoAssetMetadata } from "efi-ui/crypto/CryptoAssetMetadata";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoName } from "efi/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 *
 * @deprecated use tokenlists instead
 */
export function useCryptoAssetMetadata(
  asset: CryptoAsset | undefined
): CryptoAssetMetadata {
  const name = getCryptoName(asset);
  const symbol = getCryptoSymbol(asset);
  const decimals = getCryptoDecimals(asset);
  const icon = findAssetIcon2(asset);

  const metadata: CryptoAssetMetadata = {
    name,
    symbol,
    decimals,
    icon,
  };

  return metadata;
}
