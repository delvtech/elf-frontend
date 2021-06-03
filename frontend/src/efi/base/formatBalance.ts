import { BigNumber } from "ethers";
import { commify, formatUnits } from "ethers/lib/utils";

import { clipStringValueToDecimals } from "efi/math/fixedPoint";

export function formatBalance(
  balance: BigNumber | undefined,
  decimals: number | undefined,
  maxPrecision = 4
): string {
  if (!balance || !decimals) {
    return "0.0000";
  }

  const numBalance = +formatUnits(balance, decimals);
  return commify(
    clipStringValueToDecimals(numBalance.toString(), maxPrecision)
  );
}
