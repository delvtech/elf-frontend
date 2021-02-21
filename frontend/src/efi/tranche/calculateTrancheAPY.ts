import { ONE_YEAR_IN_MILLISECONDS } from "efi/base/time";

export function calculateTrancheAPY(
  tranchePrice: number,
  startTimestampMilliseconds: number,
  endTimestampMilliseconds: number
): number {
  // find out how long the tranche is open for to get the anualized multiplier, eg:
  // duration = 2 weeks, multiplier = 26
  const durationMs = endTimestampMilliseconds - startTimestampMilliseconds;
  const multiplier = ONE_YEAR_IN_MILLISECONDS / durationMs;

  // Figure out the discount the market is selling at
  // Note: The base asset is always worth 1
  const discount = 1 - tranchePrice;

  // annualize the discount for the apy, eg: 0.2607
  const totalYearlySavings = discount * multiplier;

  // turn it into a percent, eg: 26.07
  const apy = totalYearlySavings * 100;

  return apy;
}
