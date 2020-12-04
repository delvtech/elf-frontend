import { formatUnits } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export function formatCurrency(
  fractionalValue: BigNumber | undefined,
  decimals: number | undefined,
  defaultValue = BigNumber.from(0)
) {
  const finalValue =
    fractionalValue !== undefined ? fractionalValue : defaultValue;

  const formatted = formatUnits(finalValue, decimals);
  return formatted;
}
