import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

/**
 * Helper function to get the fiat value for a cryptocurrency.  The conversion can easily throw
 * errors if BigNumber and Moneya are used incorrectly.
 *
 * @param {number} fiatValue the value of the crypto in the fiat, i.e. 400.01
 * @param {string} fiatCode  the ISO 4217 currency country code, i.e. 'USD'
 * @param {BigNumber} cryptoFractionalValue the fractional unit value, i.e. 10000000000000000000
 * (wei)
 * @param {number} cryptoDecimals the number of decimals to convert the fractional unit value to
 */
export function convertToFiatBalance(
  fiatValue: number,
  fiatCode: string,
  cryptoFractionalValue: BigNumber,
  cryptoDecimals: number
): Money {
  // Money.fromDecimal will throw if fiatValue has more decimals than the currency allows unless you
  // pass a rounding function
  const cryptoPrice = Money.fromDecimal(fiatValue, fiatCode, Math.round);

  // formatUnits will always create a string that can be converted to a number without overflow problems
  const cryptoBalance = Number(
    formatUnits(cryptoFractionalValue, cryptoDecimals)
  );

  // Now we can safely multiply the crypto price by the balance to get the fiat balance
  return cryptoPrice.multiply(cryptoBalance, Math.round);
}
