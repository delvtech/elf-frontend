import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { assertNever } from "efi/base/assertNever";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

export function useCryptoSymbol(
  asset: CryptoAsset | undefined
): string | undefined {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenSymbol } = useTokenSymbol(tokenContract);

  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ERC20:
      return tokenSymbol || t`ERC20`;
    case CryptoAssetType.ERC20PERMIT:
      return tokenSymbol || t`ERC20Permit`;
    case CryptoAssetType.ETHEREUM:
      return "ETH";
    default:
      assertNever(assetType);
      return;
  }
}
