import { BigNumber, BigNumberish } from "ethers";
import { isBigNumberish } from "@ethersproject/bignumber/lib/bignumber";

// TODO: this really should just take a number, not a BigNumber
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
