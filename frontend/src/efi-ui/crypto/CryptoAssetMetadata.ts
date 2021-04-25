import { TokenIcon } from "efi-ui/token/TokenIcon";

export interface CryptoAssetMetadata {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  icon: TokenIcon | undefined;
}
