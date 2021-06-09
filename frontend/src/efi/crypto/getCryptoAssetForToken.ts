import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";

/**
 * Turns a token into its CryptoAsset equivalent.
 *
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function getCryptoAssetForToken(
  // TODO: Make this only a string, as an undefined would mean there is a
  // non-tokenlist token in the system, which should never happen.
  tokenAddress: string | undefined
): CryptoAsset | undefined {
  // element tranches and interest tokens are known permits

  if (!tokenAddress) {
    return;
  }

  return CryptoAssets[tokenAddress];
}
