import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { assertNever } from "efi/base/assertNever";

export function useCryptoSymbol(asset: CryptoAsset | undefined): string {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenSymbol } = useSmartContractReadCall(
    tokenContract,
    "symbol"
  );

  if (!asset) {
    return "Unknown token";
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
      return "Unknown token";
  }
}
