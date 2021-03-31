import { useCallback } from "react";

import { Vault } from "elf-contracts/types/Vault";
import { BigNumber, PayableOverrides, Signer } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";

export function useBatchSwapGivenIn(
  account: string | null | undefined,
  signer: Signer | undefined,
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amountIn: BigNumber | undefined
): () => void {
  const balancerVault = useBalancerVault();
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const { mutate: batchSwapGivenIn } = useSmartContractTransaction(
    balancerVault,
    "batchSwapGivenIn",
    signer
  );

  const onSwapGivenInTransaction = useCallback(() => {
    const callArgs = makeBatchSwapGivenInCallArgs(
      account,
      poolId,
      tokenInAddress,
      tokenOutAddress,
      amountIn
    );
    if (callArgs) {
      batchSwapGivenIn(callArgs);
    }
  }, [
    account,
    amountIn,
    batchSwapGivenIn,
    poolId,
    tokenInAddress,
    tokenOutAddress,
  ]);

  return onSwapGivenInTransaction;
}

function makeBatchSwapGivenInCallArgs(
  account: string | null | undefined,
  poolId: string | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amountIn: BigNumber | undefined
): ContractMethodArgs<Vault, "batchSwapGivenIn"> | undefined {
  if (!account || !poolId || !tokenInAddress || !tokenOutAddress || !amountIn) {
    return;
  }

  // batchSwapGivenIn requires that the assets be sorted
  const assets = [tokenInAddress, tokenOutAddress].sort();
  const tokenInIndex = assets.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = assets.findIndex(
    (address) => address === tokenOutAddress
  );

  const swaps = [
    {
      poolId,
      tokenInIndex,
      tokenOutIndex,
      amountIn,
      userData: poolId,
    },
  ];

  // trading with ourselves.  internal balance means internal to balancer.  we don't have anything
  // in there to start, but we'll keep whatever base assets we get from swapping in the balancer vault.
  const funds = {
    sender: account,
    recipient: account,
    fromInternalBalance: false,
    toInternalBalance: false,
  };
  // the user is sending this one, so the delta will be negative, so just set a limit of zero.
  const limitTokenIn = amountIn;

  // performing a SwapIn, so we can specifiy exactly how much in and set the limit to that.
  const limitTokenOut = amountIn;

  // limits of how much of each token is allowed to be traded.  order must be the same as 'tokens'
  const limits = assets.map((tokenAddress, index) => {
    if (index === tokenInIndex) {
      return limitTokenIn;
    }
    if (index === tokenOutIndex) {
      return limitTokenOut;
    }
    // this should never happen but is here for completeness
    return undefined;
  }) as BigNumber[];

  // set a large deadline for now, it was being buggy.  time is in seconds.  must be an integer.
  const deadline = Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS;

  const callArgs: ContractMethodArgs<Vault, "batchSwapGivenIn"> = [
    swaps,
    assets,
    funds,
    limits,
    deadline,
  ];
  if (tokenInAddress === BALANCER_ETH_SENTINEL) {
    const overrides: PayableOverrides = { value: amountIn };
    callArgs.push(overrides);
  }

  return callArgs;
}
