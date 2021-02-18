import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export interface TrancheInfo {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  maturity: string;
  baseAssetSymbol: CryptoSymbol;
}
