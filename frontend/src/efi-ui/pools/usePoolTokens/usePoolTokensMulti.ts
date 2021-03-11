import { Vault } from "elf-contracts/types/Vault";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";

import { UsePoolTokensQueryResult } from "./UsePoolTokensQueryResult";

export function usePoolTokensMulti(
  pools: (PoolContract | undefined)[]
): UsePoolTokensQueryResult[] {
  const balancerVault = useBalancerVault();
  const poolIdResults = useSmartContractReadCalls(pools, "getPoolId");
  const poolIds = getQueriesData(poolIdResults);
  const poolTokensResults = useSmartContractReadCalls(
    poolIds.map(() => balancerVault),
    "getPoolTokens",
    poolIds.map((poolId) => ({
      enabled: !!poolId,
      callArgs: [poolId] as ContractMethodArgs<Vault, "getPoolTokens">,
    }))
  );
  return poolTokensResults;
}
