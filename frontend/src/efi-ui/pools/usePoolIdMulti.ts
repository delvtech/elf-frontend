import { QueryObserverResult } from "react-query";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { PoolContract } from "efi/pools/PoolContract";

export function usePoolIdMulti(
  pools: (PoolContract | undefined)[]
): QueryObserverResult<string>[] {
  return useSmartContractReadCalls(pools, "getPoolId", { staleTime: Infinity });
}
