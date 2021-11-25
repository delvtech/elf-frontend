import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Vault } from "elf-contracts-typechain/dist/types/Vault";
import { BigNumber, CallOverrides, ContractReceipt, Signer } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";

import { JoinRequest } from "elf-balancer/JoinRequest";
import { useSmartContractReadCall } from "elf-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "elf-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { useSmartContractTransactionPersisted } from "elf-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import ContractAddresses from "elf/addresses";
import { BALANCER_ETH_SENTINEL } from "elf/balancer";
import { ContractMethodArgs } from "elf/contracts/types";
import { PoolContract } from "elf/pools/PoolContract";
import { balancerVaultContract } from "elf-balancer/vault";

export function useJoinConvergentPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: PoolContract | undefined,
  poolTokenMaxAmounts: BigNumber[] | undefined,
  onTransactionSubmitted?: () => void
): {
  onJoinPool: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<Vault["joinPool"]>
  >;
} {
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: [poolTokens] = [] } = usePoolTokens(pool);
  const mutationResult = useSmartContractTransactionPersisted(
    balancerVaultContract,
    "joinPool",
    signer,
    { onTransactionSubmitted: onTransactionSubmitted }
  );

  const { mutate: joinPool } = mutationResult;
  const joinPoolCallArgs = makeJoinPoolCallArgs(
    poolId,
    account,
    poolTokens,
    poolTokenMaxAmounts
  );
  const onJoinPool = useCallback(() => {
    if (!joinPoolCallArgs) {
      return;
    }
    joinPool(joinPoolCallArgs);
  }, [joinPool, joinPoolCallArgs]);

  return { onJoinPool, mutationResult };
}

function makeJoinPoolCallArgs(
  poolId: string | undefined,
  account: string | null | undefined,
  poolTokens: string[] | undefined,
  poolTokenMaxAmounts: BigNumber[] | undefined
): ContractMethodArgs<Vault, "joinPool"> | undefined {
  if (!poolId || !account || !poolTokens || !poolTokenMaxAmounts) {
    return;
  }

  let isEth = false;
  const assets = poolTokens.map((poolToken) => {
    if (poolToken === ContractAddresses.wethAddress) {
      isEth = true;
      return BALANCER_ETH_SENTINEL;
    }
    return poolToken;
  });

  // Balancer V2 vault allows userData as a way to pass props through to pool contracts.  In our
  // case we need to pass the maxAmountsIn.
  const userData = defaultAbiCoder.encode(["uint256[]"], [poolTokenMaxAmounts]);

  const joinRequest: JoinRequest = {
    fromInternalBalance: false,
    assets,
    maxAmountsIn: poolTokenMaxAmounts,
    userData,
  };

  const callArgs: ContractMethodArgs<Vault, "joinPool"> = [
    poolId,
    account,
    account,
    joinRequest,
  ];

  if (isEth) {
    const maxAmountsByPoolToken = zipObject(poolTokens, poolTokenMaxAmounts);
    const overrides: CallOverrides = {
      value: maxAmountsByPoolToken[ContractAddresses.wethAddress],
    };
    callArgs.push(overrides);
  }

  return callArgs;
}
