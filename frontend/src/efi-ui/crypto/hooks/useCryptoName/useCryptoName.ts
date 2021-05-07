import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

export function useCryptoName(
  asset: CryptoAsset | undefined
): string | undefined {
  const tokenContract = findTokenContract(asset);
  const { data: tokenName } = useTokenName(tokenContract);
  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ERC20:
      return tokenName;
    case CryptoAssetType.ERC20PERMIT:
      return tokenName;
    case CryptoAssetType.ETHEREUM:
      return "Ethereum";
    default:
      assertNever(assetType);
      return;
  }
}
