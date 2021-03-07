import { Vault } from "elf-contracts/types";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

type UsePoolTokensQueryResult = QueryObserverResult<
  [string[], BigNumber[]] & {
    tokens: string[];
    balances: BigNumber[];
  },
  unknown
>;

export function usePoolTokens(
  pool: PoolContract | undefined
): UsePoolTokensQueryResult {
  const balancerVault = useBalancerVault();
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);
  const poolTokensResults = useSmartContractReadCall(
    balancerVault,
    "getPoolTokens",
    {
      enabled: !!poolId,
      callArgs: [poolId] as ContractMethodArgs<Vault, "getPoolTokens">,
    }
  );
  return poolTokensResults;
}
