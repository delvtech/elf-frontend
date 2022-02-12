import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";

/**
 * Turns a token into its CryptoAsset equivalent.
 *
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function getCryptoAssetForToken(
  // non-tokenlist token in the system, which should never happen.
  tokenAddress: string
): CryptoAsset {
  // element tranches and interest tokens are known permits
  return CryptoAssets[tokenAddress];
}
