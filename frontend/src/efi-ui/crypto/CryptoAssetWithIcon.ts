import { AssetIcon } from "efi-ui/crypto/CryptoIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

export type CryptoAssetWithIcon = CryptoAsset & {
  assetIcon: AssetIcon;
};
