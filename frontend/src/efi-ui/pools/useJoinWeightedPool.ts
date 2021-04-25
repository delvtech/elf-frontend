import { useCallback } from "react";

import { Vault } from "elf-contracts/types/Vault";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber, CallOverrides, Signer } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import zipObject from "lodash.zipobject";

import { JoinRequest } from "efi-balancer/JoinRequest";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import ContractAddresses from "efi/contracts/contractsJson";
import { ContractMethodArgs } from "efi/contracts/types";

enum JoinKind {
  INIT,
  EXACT_TOKENS_IN_FOR_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
}

export function useJoinWeightedPool(
  signer: Signer | undefined,
  account: string | null | undefined,
  pool: WeightedPool | undefined,
  poolTokenMaxAmounts: BigNumber[] | undefined
): () => void {
  const balancerVault = useBalancerVault();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const { data: poolWeights } = useSmartContractReadCall(
    pool,
    "getNormalizedWeights"
  );
  const { data: [poolTokens] = [] } = usePoolTokens(pool);
  const { mutate: joinPool } = useSmartContractTransactionPersisted(
    balancerVault,
    "joinPool",
    signer
  );

  const joinPoolCallArgs = makeJoinPoolCallArgs(
    poolId,
    account,
    poolTokens,
    poolWeights,
    poolTokenMaxAmounts
  );
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
  account: string | null | undefined,
  poolTokens: string[] | undefined,
  poolWeights: BigNumber[] | undefined,
  poolTokenMaxAmounts: BigNumber[] | undefined
): ContractMethodArgs<Vault, "joinPool"> | undefined {
  if (
    !poolId ||
    !account ||
    !poolTokens ||
    !poolTokenMaxAmounts ||
    !poolWeights
  ) {
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

  // By setting minBPTOut we can set the slippage tolerance.
  const minBPTOut = 0;
  const userData = defaultAbiCoder.encode(
    ["uint8", "uint256[]", "uint256"],
    [JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT, poolTokenMaxAmounts, minBPTOut]
  );

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
