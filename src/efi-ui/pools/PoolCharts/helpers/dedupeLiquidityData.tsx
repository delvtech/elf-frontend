import { TimeData } from "efi/charts/TimeData";

// dedupes by timestamp.  if two or more values have the same second value, the last one is kept.

export function dedupeLiquidityData(data: TimeData[]): TimeData[] {
  // uniqBy keeps the first duplicate values.  since TimeData should be in chronological order, we
  // reverse the data to keep the last value.
  const copiedData = [...data].reverse();

  const dedupedData = _.uniqBy(copiedData, (datum) => Math.round(datum.timeMs));
  // as long as the previous value occurs at the same second,
  // put order back in ascending chronological order
  dedupedData.reverse();

  return dedupedData;
}
