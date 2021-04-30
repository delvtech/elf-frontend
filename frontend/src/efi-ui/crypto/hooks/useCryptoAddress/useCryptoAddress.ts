import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

export function useCryptoAddress(
  asset: CryptoAsset | undefined
): string | undefined {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const address = tokenContract?.address;

  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ERC20:
      return address;
    case CryptoAssetType.ERC20PERMIT:
      return address;
    case CryptoAssetType.ETHEREUM:
      return BALANCER_ETH_SENTINEL;
    default:
      assertNever(assetType);
      return;
  }
}
