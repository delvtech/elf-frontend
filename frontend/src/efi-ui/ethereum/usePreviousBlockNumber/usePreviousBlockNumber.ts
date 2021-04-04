import { QueryObserverResult, useQuery } from "react-query";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

// TODO: get a better source for this.  I picked this up from https://etherscan.io/chart/blocktime
const AVG_MINE_RATE_SECONDS = 13.1;
export function usePreviousBlockNumber(
  secondsAgo: number
): QueryObserverResult<number> {
  const result = useQuery({
    queryKey: [["blockattimestamp"], { secondsAgo: secondsAgo }],
    queryFn: async () => {
      const lastestBlockNumber = await jsonRpcProvider.getBlockNumber();

      if (secondsAgo <= 0) {
        return lastestBlockNumber;
      }

      const numBlocksSinceTimestamp = Math.round(
        AVG_MINE_RATE_SECONDS * secondsAgo
      );
      const blockNumberAtTimestamp =
        lastestBlockNumber - numBlocksSinceTimestamp;

      return blockNumberAtTimestamp;
    },
  });

  return result;
}
