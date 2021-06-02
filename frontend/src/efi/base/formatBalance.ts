import { BigNumber } from "ethers";
import { commify, formatUnits } from "ethers/lib/utils";

export function formatBalance(
  balance: BigNumber | undefined,
  decimals: number | undefined
): string {
  if (!balance || !decimals) {
    return "0.0000";
  }

  const numBalance = +formatUnits(balance, decimals);
  return commify(numBalance.toFixed(4));
}
