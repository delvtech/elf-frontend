import { BigNumber } from "ethers";

export function convertUnlockTimestampToDate(
  unlockTimestamp: BigNumber | undefined
) {
  if (!unlockTimestamp) {
    return undefined;
  }
  // unlockTimestap is in seconds since epoch, so we convert it to milliseconds for Date
  const unlockTimestampMS = +unlockTimestamp.toString() * 1000;
  return new Date(unlockTimestampMS);
}
