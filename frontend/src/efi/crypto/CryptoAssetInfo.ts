import { CryptoName } from "efi/crypto/CryptoName";

export interface CryptoAssetInfo {
  /**
   * Unique identifier for this crypt asset.
   */
  id: CryptoName;

  /**
   * The full name of the currency, eg: "Ethereum".
   */
  name: string;

  /**
   * The trading symbol of the currency, eg:  "Eth".
   */
  symbol: string;

  /**
   * Optional main color, useful for styling tags and other UIs after the
   * asset.
   */
  color?: string;

  /**
   * The image to use as the logo.
   */
  logoImgSrc?: string;
}
