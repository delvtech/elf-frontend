import { CryptoName } from "efi/crypto/CryptoName";
import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useCryptoName(asset: CryptoAsset): string {
  const tokenContract = findTokenContract(asset);
  const { data: tokenName } = useSmartContractReadCall(tokenContract, "name");
  if (asset.type === CryptoAssetType.ERC20) {
    return tokenName || t`ERC20 Token`;
  }

  return CryptoName.ETH;
}
