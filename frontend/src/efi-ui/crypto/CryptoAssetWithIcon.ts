import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

export type CryptoAssetWithIcon = CryptoAsset & {
  assetIcon: SvgIcon | undefined;
};
