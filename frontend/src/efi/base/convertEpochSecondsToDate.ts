import { BigNumber } from "ethers";

export function convertEpochSecondsToDate(
  seconds: BigNumber | undefined
): Date | undefined {
  if (!seconds) {
    return undefined;
  }
  const epochMilliseconds = +seconds.toString() * 1000;
  return new Date(epochMilliseconds);
}
