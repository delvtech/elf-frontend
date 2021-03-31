import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

/**
 * Disambiguates the crypto asset to get a suitable token address for the
 * Balancer Vault.
 */
export function getTokenAddressForBalancer(
  baseAsset: CryptoAsset | undefined
): string | undefined {
  if (!baseAsset) {
    return;
  }

  switch (baseAsset.type) {
    case CryptoAssetType.ETHEREUM:
      return BALANCER_ETH_SENTINEL;
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT:
      return baseAsset.tokenContract.address;
    default:
      return undefined;
  }
}
