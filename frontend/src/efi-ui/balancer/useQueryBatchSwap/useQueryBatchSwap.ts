import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

import { makeOnSwapGivenInCallArgs } from "../../pools/useOnSwapGivenIn/makeOnSwapGivenInCallArgs";
import { useLatestBlockNumber } from "efi-ui/ethereum/hooks/useLatestBlockNumber";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
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
  tokenIn: ERC20 | ERC20Permit | undefined,
  amount: BigNumber | undefined
): QueryObserverResult<BigNumber[]> {
  const balancerVault = useBalancerVault();

  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const tokenOut = usePoolPairedToken(pool, tokenIn);
  const queryBatchSwapResults = useSmartContractReadCall(
    balancerVault,
    "queryBatchSwap",
    {
      enabled: [poolId, tokenIn?.address, amount, tokenOut?.address].every(
        (v) => !!v
      ),
      callArgs: makeQueryBatchSwapCallArgs(
        kind,
        poolId,
        tokenIn?.address,
        amount,
        tokenOut?.address
      ),
    }
  );

  return queryBatchSwapResults;
}
