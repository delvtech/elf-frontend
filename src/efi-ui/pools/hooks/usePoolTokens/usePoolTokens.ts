import { QueryObserverResult } from "react-query";

import { Vault } from "elf-contracts-typechain/dist/types/Vault";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { PrincipalPoolTokenInfo } from "tokenlists/types";
import { balancerVaultContract } from "efi-balancer/vault";
import { YieldPoolTokenInfo } from "@elementfi/tokenlist";

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
