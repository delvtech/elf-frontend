import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { TokenMetadata } from "efi/tokenlists";
import { formatTermAssetShortSymbol } from "efi/tranche/format";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";

export function getCryptoSymbol(asset: CryptoAsset): string {
  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ETHEREUM:
      return "ETH";
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT: {
      const tokenContract = findTokenContract(asset);
      if (tokenContract?.address) {
        const tokenInfo = TokenMetadata[tokenContract.address];
        const termAssetSymbol = formatTermAssetShortSymbol(
          tokenInfo as PrincipalTokenInfo | YieldTokenInfo
        );
        // if termAssetSymbol is an empty string, just use the symbol
        return termAssetSymbol || tokenInfo.symbol;
      }
      break;
    }
    default:
      assertNever(assetType);
  }
  // should never happen
  return "ETH";
}
