import { useQuery } from "react-query";

import { BigNumber } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolContract } from "efi/pools/PoolContract";

export type SwapEvent = [
  poolId: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  amountOut: BigNumber
];

export function useSwaps(
  pool: PoolContract | undefined
): SwapEvent[] | undefined {
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const eventsQueryResult = useQuery({
    queryKey: [["balancerVault", "queryFilter", "Swap"]],
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

      const events = await balancerVault.queryFilter(filterQuery);
      return events;
    },
    enabled: !!balancerVault && !!poolId,
  });

  const { data: events = [] } = eventsQueryResult;

  const swaps = events
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
