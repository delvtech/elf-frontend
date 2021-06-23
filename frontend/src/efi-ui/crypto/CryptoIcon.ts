import { EthIcon, TokenIcon, UsdcIcon, WethIcon } from "efi-ui/token/TokenIcon";
import ContractAddresses from "efi/addresses";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

const CryptoIconSvg: Record<string, TokenIcon> = {
  [ContractAddresses.usdcAddress]: UsdcIcon,
  [ContractAddresses.wethAddress]: WethIcon,
};
export function findAssetIcon2(
  cryptoAsset: CryptoAsset | undefined
): TokenIcon | undefined {
  if (!cryptoAsset) {
    return undefined;
  }
  if (cryptoAsset.type === CryptoAssetType.ETHEREUM) {
    return EthIcon;
  }
  return CryptoIconSvg[cryptoAsset.tokenContract.address];
}
