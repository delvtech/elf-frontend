import { t } from "ttag";

import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

export function useCryptoName(asset: CryptoAsset | undefined): string {
  const tokenContract = findTokenContract(asset);
  const { data: tokenName } = useTokenName(tokenContract);
  if (!asset) {
    return "Unknown token";
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ERC20:
      return tokenName || t`ERC20 Token`;
    case CryptoAssetType.ERC20PERMIT:
      return tokenName || t`ERC20Permit Token`;
    case CryptoAssetType.ETHEREUM:
      return "Ethereum";
    default:
      assertNever(assetType);
      return "Unknown token";
  }
}
