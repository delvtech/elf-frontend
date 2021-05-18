import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { TokenMetadata } from "efi/tokenlists";

export function getCryptoName(
  asset: CryptoAsset | undefined
): string | undefined {
  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ETHEREUM:
      return "Ethereum";
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT: {
      const tokenContract = findTokenContract(asset) as ERC20Shim;
      if (tokenContract?.address) {
        return TokenMetadata[tokenContract.address].name;
      }
      return;
    }
    default:
      assertNever(assetType);
      return;
  }
}
