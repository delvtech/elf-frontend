import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useCryptoSymbol(asset: CryptoAsset | undefined): string {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenSymbol } = useSmartContractReadCall(
    tokenContract,
    "symbol"
  );
  if (asset?.type === CryptoAssetType.ERC20) {
    return tokenSymbol || t`ERC20`;
  }

  return "ETH";
}
