import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts/types/WeightedPool";

/**
 * FYTs are YieldCurvePool
 * YCs are WeightedPool
 */
export type PoolContract = ConvergentCurvePool | WeightedPool;

export function isConvergentCurvePool(
  pool: PoolContract | undefined
): pool is ConvergentCurvePool {
  if (!pool) {
    return false;
  }

  // ConvergentCurvePool has a property called `percentFee` instead of `getSwapFee`
  // TODO: is there a better way to identify the type of pool we've got?
  return !!(pool as ConvergentCurvePool).callStatic.percentFee;
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
