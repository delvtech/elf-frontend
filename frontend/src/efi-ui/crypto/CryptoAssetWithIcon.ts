import { FC, SVGProps } from "react";

import { CryptoAsset } from "efi/crypto/CryptoAsset";

export type CryptoAssetWithIcon = CryptoAsset & {
  assetIcon: FC<SVGProps<SVGSVGElement> & { title?: string }>;
};
