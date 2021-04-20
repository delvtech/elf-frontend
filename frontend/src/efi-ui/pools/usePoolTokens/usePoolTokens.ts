import { Vault } from "elf-contracts/types/Vault";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { QueryObserverResult } from "react-query";
import { BigNumber } from "ethers";

export function usePoolTokens(
  pool: PoolContract | undefined
): QueryObserverResult<
  [
    string[], // addresses
    BigNumber[] // balances
  ]
> {
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
