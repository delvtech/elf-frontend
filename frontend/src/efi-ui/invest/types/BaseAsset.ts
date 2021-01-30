import { FC, SVGProps } from "react";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export interface BaseAsset {
  id: string;
  name: string;
  symbol: CryptoSymbol;
  fiatPrice: string;
  assetIcon: FC<SVGProps<SVGSVGElement> & { title?: string }>;
}
