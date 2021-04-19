import { useCallback } from "react";

import { Vault } from "elf-contracts/types/Vault";
import { Signer } from "ethers";

import { JoinRequest } from "efi-balancer/JoinRequest";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";

export function useJoinPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: PoolContract | undefined
): () => void {
  const balancerVault = useBalancerVault();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: [poolTokens] = [] } = usePoolTokens(pool);
  const { mutate: joinPool } = useSmartContractTransactionPersisted(
    balancerVault,
    "joinPool",
    signer
  );

  const joinPoolCallArgs = makeJoinPoolCallArgs(poolId, poolTokens, account);
  const onJoinPool = useCallback(() => {
    if (!joinPoolCallArgs) {
      return;
    }
    joinPool(joinPoolCallArgs);
  }, [joinPool, joinPoolCallArgs]);
  return onJoinPool;
}

function makeJoinPoolCallArgs(
  poolId: string | undefined,
  poolTokens: string[] | undefined,
  account: string | null | undefined
): ContractMethodArgs<Vault, "joinPool"> | undefined {
  if (poolId && account && poolTokens) {
    const joinRequest: JoinRequest = {
      fromInternalBalance: false,
      assets: poolTokens,
      // TODO: Implement these
      maxAmountsIn: [],
      userData: "",
    };
    return [poolId, account, account, joinRequest];
  }
}
