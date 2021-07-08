import { sum } from "d3-array";
import { nest } from "d3-collection";
import { timeDay } from "d3-time";
import { TimeData } from "efi/charts/TimeData";

export function binDataByDay(data: TimeData[]): TimeData[] {
  const binnedData = nest<TimeData, number>()
    .key((datum) => {
      const date = new Date(datum.timeMs);
      const key = timeDay(date).getTime().toString();
      return key;
    })
    .rollup((values) => {
      return sum(values, (datum) => datum.value);
    })
    .entries(data)
    .map((data) => ({ timeMs: +data.key, value: data.value } as TimeData));

  return binnedData;
}
