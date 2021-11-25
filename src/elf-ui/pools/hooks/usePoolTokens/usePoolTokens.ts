import { QueryObserverResult } from "react-query";

import { Vault } from "elf-contracts-typechain/dist/types/Vault";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "elf-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "elf/contracts/types";
import { PoolContract } from "elf/pools/PoolContract";
import { getTokenInfo } from "elf/tokenlists";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { balancerVaultContract } from "elf-balancer/vault";

export function usePoolTokens(
  pool: PoolContract | undefined
): QueryObserverResult<
  [
    string[], // addresses
    BigNumber[], // balances
    BigNumber // lastChangeBlock
  ]
> {
  const poolId = pool?.address
    ? getTokenInfo<PrincipalPoolTokenInfo | YieldPoolTokenInfo>(pool?.address)
        .extensions.poolId
    : undefined;

  const poolTokensResults = useSmartContractReadCall(
    balancerVaultContract,
    "getPoolTokens",
    {
      enabled: !!poolId,
      callArgs: [poolId] as ContractMethodArgs<Vault, "getPoolTokens">,
    }
  );
  return poolTokensResults;
}
