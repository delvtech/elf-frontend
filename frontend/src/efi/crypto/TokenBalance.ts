import { BigNumber } from "ethers";

/**
 * The balance given in the atomic value and decimals.
 */
export interface TokenBalance {
  /**
   * the fractional unit value of the token.  i.e. wei
   */
  value: BigNumber;

  /**
   * the number of decimal places between the fractional unit value to the basic unit value.
   */
  decimals: BigNumber;
}
