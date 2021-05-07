import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 *
 * @deprecated Hooks based lookups for CryptoAsset is deprecated.  use
 * `CryptoAssets` object lookup instead.
 */
export function useCryptoAssetForToken(
  tokenAddress: string | undefined
): CryptoAsset | undefined {
  // element tranches and interest tokens are known permits

  if (!tokenAddress) {
    return;
  }

  return CryptoAssets[tokenAddress];
}
