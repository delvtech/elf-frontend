import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { TokenMetadata } from "efi/tokenlists";

export function useCryptoSymbol(
  asset: CryptoAsset | undefined
): string | undefined {
  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ETHEREUM:
      return "ETH";
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT: {
      const tokenContract = findTokenContract(asset);
      if (tokenContract?.address) {
        return TokenMetadata[tokenContract.address].symbol;
      }
      return;
    }
    default:
      assertNever(assetType);
      return;
  }
}
