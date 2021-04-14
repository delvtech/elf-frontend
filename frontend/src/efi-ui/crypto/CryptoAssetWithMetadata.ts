import { BigNumber } from "ethers";

import { SvgIcon } from "efi-ui/base/SvgIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

export type CryptoAssetWithMetadata = CryptoAsset & {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  balanceOf: BigNumber | undefined;
  assetIcon: SvgIcon;
};
