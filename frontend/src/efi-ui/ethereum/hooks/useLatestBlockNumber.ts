import { Web3Provider } from "@ethersproject/providers";
import { QueryObserverResult, useQuery } from "react-query";

/**
 * Returns the block number (or height) of the most recently mined block.
 */
export function useLatestBlockNumber(
  library: Web3Provider | undefined
): QueryObserverResult<number> {
  return useQuery({
    queryKey: "ethereum-latest-block",
    queryFn: () => library?.getBlockNumber(),
    enabled: !!library,
  });
}
