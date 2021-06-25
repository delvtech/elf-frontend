import { QueryObserverResult } from "react-query";

import { Vault } from "elf-contracts/types/Vault";
import { BigNumber } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { getTokenInfo } from "efi/tokenlists";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";

export function usePoolTokens(
  pool: PoolContract | undefined
): QueryObserverResult<
  [
    string[], // addresses
    BigNumber[], // balances
    BigNumber // lastChangeBlock
  ]
> {
  const balancerVault = useBalancerVault();
  const poolId = pool?.address
    ? getTokenInfo<PrincipalPoolTokenInfo | YieldPoolTokenInfo>(pool?.address)
        .extensions.poolId
    : undefined;

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
