import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

/**
 * @deprecated Use CryptoAsset instead
 */
export interface CryptoAssetInfoOld {
  /**
   * The full name of the currency, eg: "Ethereum".
   */
  name: string;

  /**
   * The trading symbol of the currency, eg:  "Eth".
   */
  symbol: CryptoSymbolOld;

  /**
   * The image to use as the logo.
   */
  logoImgSrc?: string;
}
