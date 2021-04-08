import { useQuery } from "react-query";

import { zip } from "d3-array";
import { BigNumber } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";

type PoolJoinedArguments = [
  poolId: string,
  sender: string,
  assets: string[],
  amountsIn: BigNumber[],
  dueProtocolFeeAmounts: BigNumber[]
];

type PoolExitedArguments = [
  poolId: string,
  sender: string,
  assets: string[],
  amountsOut: BigNumber[],
  dueProtocolFeeAmounts: BigNumber[]
];

/**
 * Returns the amount of liquidity added or removed for each token in a time
 * period.
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds to query back to from now.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */
export function useTokenDeltasForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS
): BigNumber[] | undefined {
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);

  const { data: joinEvents = [] } = useQuery({
    queryKey: [
      ["balancerVault", "queryFilter", "PoolJoined"],
      { poolId, fromBlockNumber },
    ],
    queryFn: async () => {
      if (!balancerVault || !poolId) {
        return;
      }

      const filterQuery = balancerVault.filters.PoolBalanceChanged(
        poolId,
        null,
        null,
        null,
        null
      );

      const events = await balancerVault.queryFilter(
        filterQuery,
        fromBlockNumber
      );
      return events;
    },
    enabled: !!balancerVault && !!poolId && !!fromBlockNumber,
  });

  const { data: exitEvents = [] } = useQuery({
    queryKey: [
      ["balancerVault", "queryFilter", "PoolExited"],
      { poolId, fromBlockNumber },
    ],
    queryFn: async () => {
      if (!balancerVault || !poolId) {
        return;
      }

      const filterQuery = balancerVault.filters.PoolBalanceChanged(
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

  // [token0, token1]
  const totalAmountsIn = [BigNumber.from(0), BigNumber.from(0)];
  const totalAmountsOut = [BigNumber.from(0), BigNumber.from(0)];

  if (joinEvents.length) {
    joinEvents.forEach((event) => {
      const joinEvent = event?.args as PoolJoinedArguments;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [poolId, sender, assets, amountsIn] = joinEvent;
      totalAmountsIn[0] = totalAmountsIn[0].add(amountsIn[0]);
      totalAmountsIn[1] = totalAmountsIn[1].add(amountsIn[1]);
    });
  }

  if (exitEvents.length) {
    exitEvents.forEach((event) => {
      const exitEvent = event?.args as PoolExitedArguments;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [poolId, sender, assets, amountsOut] = exitEvent;
      totalAmountsOut[0] = totalAmountsOut[0].add(amountsOut[0]);
      totalAmountsOut[1] = totalAmountsOut[1].add(amountsOut[1]);
    });
  }

  const tokenDeltas = zip(totalAmountsIn, totalAmountsOut).map((amounts) => {
    const amountIn = amounts[0];
    const amountOut = amounts[1];
    return amountIn.sub(amountOut);
  });

  // values ordered by ascending token address
  return tokenDeltas;
}
