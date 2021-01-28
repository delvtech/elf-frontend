import { FC, SVGProps } from "react";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Erc20 } from "elf-contracts/types/Erc20";

export interface BaseAsset {
  id: string;
  name: string;
  symbol: CryptoSymbol;
  fiatPrice: string;
  assetIcon: FC<SVGProps<SVGSVGElement> & { title?: string }>;
}
