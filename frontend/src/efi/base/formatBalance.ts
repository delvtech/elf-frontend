import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";

export function formatBalance(
  balance: BigNumber | undefined,
  decimals: number | undefined
): string {
  if (!balance || !decimals) {
    return "0";
  }

  const numBalance = +formatUnits(balance, decimals);
  return numBalance.toFixed(4);
}
