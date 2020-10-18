import { CryptoName } from "efi/crypto/crypto";

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
   * String path to the logo, starting from the public/ directory, eg:
   * "./assets/logos/etherum.svg".
   */
  logoPath?: string;
}
