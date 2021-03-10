import { QueryObserverResult } from "react-query";

import { BigNumber } from "ethers";
import { zipWith } from "lodash";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import {
  isWeightedPool,
  isYieldCurvePool,
  PoolContract,
} from "efi/pools/PoolContract";

export function usePoolSwapFeeMulti(
  pools: (PoolContract | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const swapFeeYieldCurvePoolResults = useSmartContractReadCalls(
    pools.map((pool) => (isYieldCurvePool(pool) ? pool : undefined)),
    "percentFee"
  );
  const swapFeeWeightedPoolResults = useSmartContractReadCalls(
    pools.map((pool) => (isWeightedPool(pool) ? pool : undefined)),
    "getSwapFee"
  );

  const swapFeeResults = zipWith(
    pools,
    swapFeeYieldCurvePoolResults,
    swapFeeWeightedPoolResults,
    (pool, ycpResult, wpResult) => {
      if (isWeightedPool(pool)) {
        return wpResult;
      }
      if (isYieldCurvePool(pool)) {
        return ycpResult;
      }

      // This should never happen, but for the sake of type safety we return the
      // ycpResult instead of undefined.
      // TODO: Make this an exhaustive case w/ a typeAssert(never) pattern
      return ycpResult;
    }
  );
  return swapFeeResults;
}
