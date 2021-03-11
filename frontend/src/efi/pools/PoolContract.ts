import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { YieldCurvePool } from "elf-contracts/types/YieldCurvePool";

/**
 * FYTs are YieldCurvePool
 * YCs are WeightedPool
 */
export type PoolContract = YieldCurvePool | WeightedPool;

export function isYieldCurvePool(
  pool: PoolContract | undefined
): pool is YieldCurvePool {
  if (!pool) {
    return false;
  }

  // YieldCurvePool has a property called `percentFee` instead of `getSwapFee`
  // TODO: is there a better way to identify the type of pool we've got?
  return !!(pool as YieldCurvePool).callStatic.percentFee;
}

export function isWeightedPool(
  pool: PoolContract | undefined
): pool is WeightedPool {
  if (!pool) {
    return false;
  }

  // YieldCurvePool has a property called `getSwapFee` instead of `percentFee`
  // TODO: is there a better way to identify the type of pool we've got?
  return !!(pool as WeightedPool).callStatic.getSwapFee;
}
