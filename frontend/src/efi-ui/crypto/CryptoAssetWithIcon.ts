import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * @deprecated CryptoAsset should not be extended to include icons. Use
 * findAssetIcon(cryptoAsset) instead.
 */
export type CryptoAssetWithIcon = CryptoAsset & {
  assetIcon: SvgIcon | undefined;
};
