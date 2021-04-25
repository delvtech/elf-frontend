import { TokenIcon } from "efi-ui/ethereum/EthIcon";

export interface CryptoAssetMetadata {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number | undefined;
  icon: TokenIcon | undefined;
}
