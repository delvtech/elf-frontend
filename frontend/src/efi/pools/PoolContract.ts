import { WeightedPool, YieldCurvePool } from "elf-contracts/types";

/**
 * FYTs are YieldCurvePool
 * YCs are WeightedPool
 */
export type PoolContract = YieldCurvePool | WeightedPool;
