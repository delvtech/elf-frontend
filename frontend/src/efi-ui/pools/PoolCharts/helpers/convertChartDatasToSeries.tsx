import { Serie } from "@nivo/line";
import { convertTimeDataToSerie } from "efi-ui/pools/PoolCharts/helpers/convertTimeDataToSerie";
import { dedupeLiquidityData } from "efi-ui/pools/PoolCharts/helpers/dedupeLiquidityData";
import { TimeData } from "efi/charts/TimeData";

export function convertChartDatasToSeries(
  liquidityData: TimeData[] | undefined,
  volumeData: TimeData[] | undefined,
  fromTimestamp: number,
  toTimeStamp: number
): Record<string, Serie[]> {
  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredLiquidityData =
    liquidityData?.filter(
      (datum) =>
        datum.value >= 0 &&
        datum.timeMs >= fromTimestamp &&
        datum.timeMs <= toTimeStamp
    ) ?? [];

  // make sure chart data fills up chart
  const paddedLiquidityData = padTimeData(
    filteredLiquidityData,
    fromTimestamp,
    toTimeStamp
  );

  // remove data that have the same timestamp
  const dedupedLiquidityData = dedupeLiquidityData(paddedLiquidityData);

  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredVolumeData =
    volumeData?.filter(
      (datum) => datum.timeMs >= fromTimestamp && datum.timeMs <= toTimeStamp
    ) ?? [];

  const liquiditySerie = convertTimeDataToSerie(
    dedupedLiquidityData,
    "liquidity"
  );
  const volumeSerie = convertTimeDataToSerie(filteredVolumeData, "volume");
  return { liquiditySerie, volumeSerie };
}

function padTimeData(
  data: TimeData[],
  fromTimestamp: number,
  toTimestamp: number
) {
  if (!data.length) {
    return data;
  }

  const firstDatum: TimeData = { ...data[0], timeMs: fromTimestamp + 1 };
  const lastDatum: TimeData = {
    ...data[data.length - 1],
    timeMs: toTimestamp - 1,
  };

  return [firstDatum, ...data, lastDatum];
}
