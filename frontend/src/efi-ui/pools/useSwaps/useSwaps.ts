import { SwapEventWithTimeStamp } from "efi-balancer/SwapEvent";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import {
  AVG_MINE_RATE_SECONDS,
  usePreviousBlockNumber,
} from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";
import { useMemo } from "react";

export function useSwaps(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): SwapEventWithTimeStamp[] | undefined {
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: toBlockNumber } = usePreviousBlockNumber(toTime);
  const { data: lastestBlockNumber } = useLatestBlockNumber();

  const { data: events = [] } = useSmartContractEvents(balancerVault, "Swap", {
    callArgs: [poolId as string, null, null, null, null],
    enabled: !!poolId && !!fromBlockNumber,
    fromBlock: fromBlockNumber,
    toBlock: toBlockNumber,
  });

  const swaps: SwapEventWithTimeStamp[] = useMemo(() => {
    if (!lastestBlockNumber) {
      return [];
    }

    return events
      .map((event) => {
        const { args, blockNumber } = event;
        if (!args) {
          return undefined;
        }
        const nowInMs = Date.now();

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
