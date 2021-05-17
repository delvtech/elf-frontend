import { QueryObserverResult, useQuery } from "react-query";

import { AVG_MINE_RATE_SECONDS } from "efi/ethereum/miningRate";
import { defaultProvider } from "efi/providers/providers";

export function usePreviousBlockNumber(
  secondsAgo: number | undefined
): QueryObserverResult<number> {
  const result = useQuery({
    queryKey: [["blockattimestamp"], { secondsAgo: secondsAgo }],
    queryFn: async () => {
      const lastestBlockNumber = await defaultProvider.getBlockNumber();

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
