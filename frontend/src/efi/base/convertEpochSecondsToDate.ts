import { BigNumber, BigNumberish } from "ethers";
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";

export function convertEpochSecondsToDate(
  seconds: BigNumberish | undefined
): Date | undefined {
  if (!seconds || !isBigNumberish(seconds)) {
    return undefined;
  }
  const secondsBigNumber = BigNumber.from(seconds);

  const epochMilliseconds = +secondsBigNumber.toString() * 1000;
  return new Date(epochMilliseconds);
}
