import { Money } from "ts-money";

/**
 * Helper to convert a Money object to a human readable string
 * @param {Money} money value to be formatted
 */
export function getFormattedMoney(
  money: Money | undefined,
  defaultValue: string = "0"
): string {
  if (!money) {
    return defaultValue;
  }

  return money
    .toDecimal()
    .toFixed(money.getCurrencyInfo().decimal_digits)
    .toLocaleString();
}
