import { isBigNumberish } from "efi/base/isBigNumberish";
import { BigNumber, BigNumberish } from "ethers";

/**
 * @deprecated BigNumberish should not be used, use convetEpochSecondsToDate2 instead
 */
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

export function convertEpochSecondsToDate2(seconds: number): Date {
  const epochMilliseconds = seconds * 1000;
  return new Date(epochMilliseconds);
}
