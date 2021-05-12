import { TokenIcon } from "efi-ui/token/TokenIcon";

/**
 * @deprecated use tokenlist instead, eg: `TokenMetadata[address].decimals`
 */
export interface CryptoAssetMetadata {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  icon: TokenIcon | undefined;
}
