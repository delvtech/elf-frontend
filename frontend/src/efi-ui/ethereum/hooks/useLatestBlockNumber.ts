import { QueryObserverResult, useQuery } from "react-query";

import { Provider } from "@ethersproject/providers";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * Returns the block number (or height) of the most recently mined block.
 */
export function useLatestBlockNumber(
  provider?: Provider | undefined
): QueryObserverResult<number> {
  const finalProvider = provider || jsonRpcProvider;
  return useQuery({
    queryKey: "ethereum-latest-block",
    queryFn: () => finalProvider?.getBlockNumber(),
    enabled: !!finalProvider,
    // Never cache this as block number increases every 15 seconds
    cacheTime: 0,
  });
}
