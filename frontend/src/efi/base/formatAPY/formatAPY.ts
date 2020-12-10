import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

export function formatAPY(
  apy: BigNumber | undefined,
  defaultValue = "–"
): string {
  if (apy === undefined) {
    return defaultValue;
  }

  const formatted = formatUnits(apy, 16);
  return formatted;
}
