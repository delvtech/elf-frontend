import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { CryptoName } from "efi/crypto/CryptoName";

export interface CryptoAssetInfo {
  /**
   * The full name of the currency, eg: "Ethereum".
   */
  name: CryptoName;

  /**
   * The trading symbol of the currency, eg:  "Eth".
   */
  symbol: CryptoSymbol;

  /**
   * The image to use as the logo.
   */
  logoImgSrc?: string;
}
