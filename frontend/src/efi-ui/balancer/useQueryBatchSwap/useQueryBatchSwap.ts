import { QueryObserverResult } from "react-query";

import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { PoolContract } from "efi/pools/PoolContract";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { makeQueryBatchSwapCallArgs } from "efi-ui/balancer/useQueryBatchSwap/makeQueryBatchSwapCallArgs";
import { SwapKind } from "efi-ui/balancer/SwapKind";

/**
 * Useful for previewing a swap in the balancer V2 vault.
 *
 * NOTE: This should *not* be used to check spot price since batch swaps can
 * incur additional fees and costs. To check spot price, use useOnSwapGivenIn
 * instead.
 */
export function useQueryBatchSwap(
  kind: SwapKind,
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber[]> {
  const balancerVault = useBalancerVault();

  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const queryBatchSwapResults = useSmartContractReadCall(
    balancerVault,
    "queryBatchSwap",
    {
      enabled: [poolId, tokenInAddress, amount, tokenOutAddress].every(
        (v) => !!v
      ),
      callArgs: makeQueryBatchSwapCallArgs(
        kind,
        poolId,
        tokenInAddress,
        amount,
        tokenOutAddress
      ),
    }
  );

  return queryBatchSwapResults;
}
