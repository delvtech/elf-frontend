import { QueryObserverResult, useQuery } from "react-query";

import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";

// TODO: get a better source for this.  I picked this up from https://etherscan.io/chart/blocktime
const PRODUCTION = process.env.NODE_ENV === "production";
// the average for this entire year is about 13.1s / block.  For local development though we just
// use 10 blocks to represent one day.
export const AVG_MINE_RATE_SECONDS = PRODUCTION
  ? 13.1
  : ONE_DAY_IN_SECONDS / 100;

export function usePreviousBlockNumber(
  secondsAgo: number | undefined
): QueryObserverResult<number> {
  const result = useQuery({
    queryKey: [["blockattimestamp"], { secondsAgo: secondsAgo }],
    queryFn: async () => {
      const lastestBlockNumber = await jsonRpcProvider.getBlockNumber();

      if (!secondsAgo || secondsAgo <= 0) {
        return lastestBlockNumber;
      }

      const numBlocksSinceTimestamp = Math.round(
        secondsAgo / AVG_MINE_RATE_SECONDS
      );
      const blockNumberAtTimestamp =
        lastestBlockNumber - numBlocksSinceTimestamp;

      return blockNumberAtTimestamp;
    },
  });

  return result;
}
