import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";

/**
 * The names of all crypto assets supported in Element.
 * @deprecated Get the name of the token from it's contract instead.
 */
export const CryptoName: Record<CryptoSymbolOld, string> = {
  ETH: "Ethereum",

  /**
   * Ether
   */
  WETH: "Wrapped Ether",

  /**
   * USD Coin
   */
  USDC: "USD Coin",

  /**
   * Dai
   */
  DAI: "Dai",

  /**
   * Yearn-Wrapped Dai
   */
  yDAI: "Yearn Wrapped Dai",

  /**
   * Yearn LP Token
   */
  YFI: "yearn.finance",

  /**
   * Yearn-Wrapped tUSD
   */
  yTUSD: "Yearn Wrapped TUSD",

  /**
   * Yearn-Wrapped USDCoin
   */
  yUSDC: "Yearn Wrapped USD Coin",

  /**
   * Yearn-Wrapped USDT
   */
  yUSDT: "Yearn Wrapped USDT",

  /**
   * Yearn-Wrapped Ether
   */
  yETH: "Yearn Wrapped Ethereum",

  /**
   * Element Low Risk Pool Token
   */
  "ELF-L": "Element Low Risk Pool Token",

  /**
   * Element Medium Risk Pool Token
   */
  "ELF-M": "Element Medium Risk Pool Token",

  /**
   * Element High Risk Pool Token
   */
  "ELF-H": "Element High Risk Pool Token",
};
