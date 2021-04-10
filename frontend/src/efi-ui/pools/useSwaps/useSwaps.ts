import { useQuery } from "react-query";

import { SwapEvent } from "efi-balancer/SwapEvent";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

export function useSwaps(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): SwapEvent[] | undefined {
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: toBlockNumber } = usePreviousBlockNumber(toTime);

  const { data: events = [] } = useQuery({
    queryKey: [
      ["balancerVault", "queryFilter", "Swap"],
      { poolId, fromBlockNumber },
    ],
    queryFn: async () => {
      if (!balancerVault || !poolId) {
        return;
      }

      const filterQuery = balancerVault.filters.Swap(
        poolId,
        null,
        null,
        null,
        null
      );

      const events = await balancerVault.queryFilter(
        filterQuery,
        fromBlockNumber,
        toBlockNumber
      );
      return events;
    },
    enabled: !!balancerVault && !!poolId && !!fromBlockNumber,
  });

  const swaps: SwapEvent[] = events
    .map((event) => {
      const { args } = event;
      if (!args) {
        return undefined;
      }

      const [poolId, tokenIn, tokenOut, amountIn, amountOut] = args;
      return [poolId, tokenIn, tokenOut, amountIn, amountOut];
    })
    .filter((swap): swap is SwapEvent => {
      if (!swap) {
        return false;
      }
      const [poolId, tokenIn, tokenOut, amountIn, amountOut] = swap;
      return !!poolId && !!tokenIn && !!tokenOut && !!amountIn && !!amountOut;
    });

  return swaps;
}
