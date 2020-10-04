export interface CryptoAssetInfo {
  /**
   * Unique identifier for this crypt asset.
   */
  id: string;

  /**
   * The full name of the currency, eg: "Ethereum".
   */
  name: string;

  /**
   * The trading symbol of the currency, eg:  "Eth".
   */
  symbol: string;

  /**
   * String path to the logo, eg: "./etherum.svg".
   */
  logoPath?: string;
}
