import { Serie } from "@nivo/line";
import { convertTimeDataToSerie } from "efi-ui/pools/PoolCharts/helpers/convertTimeDataToSerie";
import { dedupeLiquidityData } from "efi-ui/pools/PoolCharts/helpers/dedupeLiquidityData";
import { TimeData } from "efi/charts/TimeData";

export function convertChartDatasToSeries(
  liquidityData: TimeData[] | undefined,
  volumeData: TimeData[] | undefined,
  cutoffTimestamp: number
): Record<string, Serie[]> {
  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredLiquidityData =
    liquidityData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > cutoffTimestamp
    ) ?? [];

  // remove data that have the same timestamp
  const dedupedLiquidityData = dedupeLiquidityData(filteredLiquidityData);

  // because we are estimating block timestamps, make sure we don't have any older than our time frame
  const filteredVolumeData =
    volumeData?.filter(
      (datum) => datum.value >= 0 && datum.timeMs > cutoffTimestamp
    ) ?? [];

  const liquiditySerie = convertTimeDataToSerie(
    dedupedLiquidityData,
    "liquidity"
  );
  const volumeSerie = convertTimeDataToSerie(filteredVolumeData, "volume");
  return { liquiditySerie, volumeSerie };
}
