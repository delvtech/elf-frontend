import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { NUM_ETH_DECIMALS } from "efi/ethereum";
import { TokenMetadata } from "efi/tokenlists";

export function useCryptoDecimals(
  asset: CryptoAsset | undefined
): number | undefined {
  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ETHEREUM:
      return NUM_ETH_DECIMALS;
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT: {
      const tokenContract = findTokenContract(asset);
      if (tokenContract?.address) {
        return TokenMetadata[tokenContract.address].decimals;
      }
      return;
    }
    default:
      assertNever(assetType);
  }
}
