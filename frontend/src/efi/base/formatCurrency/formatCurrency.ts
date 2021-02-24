import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

export function formatCurrency(
  fractionalValue: BigNumber | undefined,
  decimals: number | undefined,
  defaultValue = "0"
): string {
  if (fractionalValue === undefined || decimals === undefined) {
    return defaultValue;
  }

  const formatted = formatUnits(fractionalValue, decimals);
  return formatted;
}
