import { BigNumber } from "ethers";
import { commify, formatUnits } from "ethers/lib/utils";

import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";

export function formatBalance(
  balance: BigNumber | undefined,
  decimals: number | undefined,
  maxPrecision = 4
): string {
  if (!balance || !decimals) {
    return "0.0000";
  }

  const stringBalance = formatUnits(balance, decimals);
  return commify(clipStringValueToDecimals(stringBalance, maxPrecision));
}
