import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";
import { Money } from "ts-money";

export function useVolumeTrend(pool: PoolContract | undefined): {
  volume24hr: number | undefined;
  volumeTrend: number | undefined;
} {
  const volume24hr = useVolumeForPool(pool, ONE_DAY_IN_SECONDS);
  // // the volume from 48hrs ago to 24hrs ago
  const volumePrevious24hr = useVolumeForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  const volumeTrend = getTrend(volumePrevious24hr, volume24hr);
  return { volume24hr, volumeTrend };
}

export function useFeeVolumeTrend(pool: PoolContract | undefined): {
  feeVolume24hr?: Money;
  feeVolumeTrend?: number;
} {
  const feeVolume24hr = useFeeVolumeFiatForPool(pool, ONE_DAY_IN_SECONDS);
  const feeVolumePrevious24hr = useFeeVolumeFiatForPool(
    pool,
    ONE_DAY_IN_SECONDS * 2,
    ONE_DAY_IN_SECONDS
  );

  if (!feeVolume24hr) {
    return {};
  }

  const feeVolumeTrend = getTrend(
    feeVolumePrevious24hr?.toDecimal(),
    feeVolume24hr?.toDecimal()
  );
  return { feeVolume24hr, feeVolumeTrend };
}

function getTrend(
  oldValue: number | undefined,
  newValue: number | undefined
): number | undefined {
  if (oldValue === undefined || newValue === undefined) {
    return undefined;
  }

  if (oldValue === 0 || newValue === 0) {
    return 0;
  }

  const trend = (newValue - oldValue) / oldValue;

  return trend;
}
