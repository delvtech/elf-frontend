import { BigNumber } from "ethers";
import { timeFormat } from "d3-time-format";

/**
 * @deprecated use convertUnlockTimestampToDate instead along with date helpers in base/dates.ts
 */
export function formatUnlockTimestamp(unlockTimestamp: BigNumber | undefined) {
  const unlockTimestampMS = +(unlockTimestamp?.toString() || 0) * 1000;
  const redeemableDate = new Date(unlockTimestampMS);
  return timeFormat("%B %d, %Y")(redeemableDate);
}
