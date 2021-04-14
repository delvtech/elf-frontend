import { QueryObserverResult } from "react-query";

import { Vault } from "elf-contracts/types/Vault";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { makeQueryBatchSwapCallArgs } from "efi-ui/balancer/useQueryBatchSwap/makeQueryBatchSwapCallArgs";
import { getQueriesData } from "efi-ui/base/queryResults";
import {
  useSmartContractReadCalls,
  UseSmartContractReadCallsOptions,
} from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { PoolContract } from "efi/pools/PoolContract";

export function useQueryBatchSwapMulti(
  kind: SwapKind,
  pools: (PoolContract | undefined)[],
  tokenInAddresses: (string | undefined)[],
  tokenOutAddresses: (string | undefined)[],
  amounts: (BigNumber | undefined)[]
): QueryObserverResult<BigNumber[]>[] {
  const balancerVault = useBalancerVault();

  const poolIdResults = useSmartContractReadCalls(pools, "getPoolId");
  const poolIds = getQueriesData(poolIdResults);

  const zipped = zip(poolIds, tokenInAddresses, amounts, tokenOutAddresses);
  const readCallOptions = zipped.map(
    ([poolId, tokenInAddress, amount, tokenOutAddress]):
      | UseSmartContractReadCallsOptions<Vault, "queryBatchSwap">
      | undefined => {
      const callArgs = makeQueryBatchSwapCallArgs(
        kind,
        poolId,
        tokenInAddress,
        amount,
        tokenOutAddress
      );
      // must check undefined as `kind` is an enum of 0 or 1
      const enabled = !!callArgs?.every((v) => v !== undefined);
      return {
        enabled,
        callArgs,
      };
    }
  );

  const queryBatchSwapResults = useSmartContractReadCalls(
    pools.map(() => balancerVault),
    "queryBatchSwap",
    readCallOptions
  );

  return queryBatchSwapResults;
}
