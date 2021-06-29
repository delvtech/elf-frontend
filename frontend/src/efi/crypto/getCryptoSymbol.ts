import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { TokenMetadata } from "efi/tokenlists";

export function getCryptoSymbol(asset: CryptoAsset): string {
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
      break;
    }
    default:
      assertNever(assetType);
  }
  // should never happen
  return "ETH";
}
