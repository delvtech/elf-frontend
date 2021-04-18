import { BigNumber } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { PoolContract } from "efi/pools/PoolContract";

type PoolBalanceChangedArguments = [
  poolId: string,
  sender: string,
  assets: string[],
  amounts: BigNumber[],
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

  const { data: events = [] } = useSmartContractEvents(
    balancerVault,
    "PoolBalanceChanged",
    {
      callArgs: [poolId as string, null, null, null, null],
      enabled: !!poolId && !fromBlockNumber,
      fromBlock: fromBlockNumber,
    }
  );

  // [token0, token1]
  const totalDeltaPerToken = [BigNumber.from(0), BigNumber.from(0)];

  events.forEach((event) => {
    const changeEvent = event?.args as PoolBalanceChangedArguments;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [poolId, sender, assets, amounts] = changeEvent;
    totalDeltaPerToken[0] = totalDeltaPerToken[0].add(amounts[0]);
    totalDeltaPerToken[1] = totalDeltaPerToken[1].add(amounts[1]);
  });

  return totalDeltaPerToken;
}
