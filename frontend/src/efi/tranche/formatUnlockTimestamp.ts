import { BigNumber } from "ethers";
import { timeFormat } from "d3-time-format";

export function formatUnlockTimestamp(unlockTimestamp: BigNumber | undefined) {
  const unlockTimestampMS = +(unlockTimestamp?.toString() || 0) * 1000;
  const redeemableDate = new Date(unlockTimestampMS);
  return timeFormat("%B %d, %Y")(redeemableDate);
}
