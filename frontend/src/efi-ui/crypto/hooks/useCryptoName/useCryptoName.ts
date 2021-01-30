import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { CryptoName } from "efi/crypto/CryptoName";
import { t } from "ttag";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

export function useCryptoName(asset: CryptoAsset) {
  const tokenContract = findTokenContract(asset);
  const [tokenName] = useTokenName(tokenContract);
  if (asset.type === CryptoAssetType.ERC20) {
    return tokenName || t`ERC20 Token`;
  }

  return CryptoName.ETH;
}
