import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

export function useCryptoSymbol(asset: CryptoAsset) {
  const tokenContract = findTokenContract(asset);
  const [tokenSymbol] = useTokenSymbol(tokenContract);
  if (asset.type === CryptoAssetType.ERC20) {
    return tokenSymbol || t`ERC20`;
  }

  return "ETH";
}
