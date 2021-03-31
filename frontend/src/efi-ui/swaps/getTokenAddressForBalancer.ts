import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

/**
 * Disambiguates the crypto asset to get a suitable token address for the
 * Balancer Vault.
 */
export function getTokenAddressForBalancer(
  cryptoAsset: CryptoAsset | undefined
): string | undefined {
  if (!cryptoAsset) {
    return;
  }

  switch (cryptoAsset.type) {
    case CryptoAssetType.ETHEREUM:
      return BALANCER_ETH_SENTINEL;
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT:
      return cryptoAsset.tokenContract.address;
    default:
      return undefined;
  }
}
