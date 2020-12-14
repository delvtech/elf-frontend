import { Money } from "ts-money";

/**
 * Helper to convert a Money object to a human readable string
 * @param {Money} money value to be formatted
 */
export function formatMoney(
  money: Money | undefined,
  defaultValue: string = "0.00"
): string {
  if (!money) {
    return defaultValue;
  }

  const fractionDigits = money.getCurrencyInfo().decimal_digits;

  // This is how you express `(10000).toFixed(precision).toLocaleString()` such
  // that you get commmas inserted where they belong and the correct number of
  // digits after the decimal point.
  const formatted = money.toDecimal().toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatted;
}
