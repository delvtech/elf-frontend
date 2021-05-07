import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";

/**
 * Turns a list of tokens into a list of CryptoAsset equivalents.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 *
 * @deprecated hooks based lookups for crypto asset is deprecated.  use
 * CryptoAssets lookup object instead.
 */
export function useCryptoAssetForTokenMulti(
  tokenAddresses: (string | undefined)[]
): (CryptoAsset | undefined)[] {
  return tokenAddresses.map((address) =>
    address ? CryptoAssets[address] : undefined
  );
}
