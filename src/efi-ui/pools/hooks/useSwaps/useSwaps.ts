import { useMemo } from "react";

import { SwapEventWithTimeStamp } from "efi-balancer/SwapEvent";
import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { EMPTY_ARRAY } from "efi/base/emptyArray";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { AVG_MINE_RATE_SECONDS } from "efi/ethereum/miningRate";
import { PoolInfo } from "efi/pools/PoolInfo";
import { balancerVaultContract } from "efi-balancer/vault";

export function useSwaps(
  poolInfo: PoolInfo,
  fromTime: number = ONE_WEEK_IN_SECONDS,
  toTime?: number
): SwapEventWithTimeStamp[] | undefined {
  const { poolId } = poolInfo.extensions;
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: toBlockNumber } = usePreviousBlockNumber(toTime);
  const { data: lastestBlockNumber } = useLatestBlockNumber();

  const { data: events = [] } = useSmartContractEvents(
    balancerVaultContract,
    "Swap",
    {
      callArgs: [poolId as string, null, null, null, null],
      enabled: !!poolId && !!fromBlockNumber,
      fromBlock: fromBlockNumber,
      toBlock: toBlockNumber,
      refetchOnWindowFocus: false,
    }
  );
  const swaps: SwapEventWithTimeStamp[] = useMemo(() => {
    if (!lastestBlockNumber) {
      return EMPTY_ARRAY as SwapEventWithTimeStamp[];
    }
    // ok to use Date.now() directly since this hook updates every time latestBlockNumber updates
    const nowInMs = Date.now();

    return events
      .map((event) => {
        const { args, blockNumber } = event;
        if (!args) {
          return undefined;
        }

        // estimating timestamp here by taking the current time and subtracting the mining rate
        // multiplied by the number blocks mined:
        const timeStamp =
          nowInMs -
          (lastestBlockNumber - blockNumber) * AVG_MINE_RATE_SECONDS * 1000;

        const [poolId, tokenIn, tokenOut, amountIn, amountOut] = args;
        return [poolId, tokenIn, tokenOut, amountIn, amountOut, timeStamp];
      })
      .filter((swap): swap is SwapEventWithTimeStamp => {
        if (!swap) {
          return false;
        }
        const [poolId, tokenIn, tokenOut, amountIn, amountOut] = swap;
        return !!poolId && !!tokenIn && !!tokenOut && !!amountIn && !!amountOut;
      });
  }, [events, lastestBlockNumber]);

  return swaps;
}
