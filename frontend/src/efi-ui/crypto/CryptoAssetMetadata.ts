import { SvgIcon } from "efi-ui/base/SvgIcon";

export interface CryptoAssetMetadata {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  icon: SvgIcon | undefined;
}
