import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

export interface CryptoAssetInfo {
  /**
   * The full name of the currency, eg: "Ethereum".
   */
  name: string;

  /**
   * The trading symbol of the currency, eg:  "Eth".
   */
  symbol: CryptoSymbol;

  /**
   * The image to use as the logo.
   */
  logoImgSrc?: string;
}
