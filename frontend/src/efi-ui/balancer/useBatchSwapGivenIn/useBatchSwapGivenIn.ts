import { useCallback } from "react";

import { Vault } from "elf-contracts/types/Vault";
import { BigNumber, PayableOverrides, Signer } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * Hook wrapper for the Balancer Vault's batchSwapGivenIn method.
 *
 * Note: This hook takes token addresses as arguments because the Balancer
 * Vault supports eth via a sentinel token address, see: BALANCER_ETH_SENTINAL
 */
export function useBatchSwapGivenIn(
  account: string | null | undefined,
  signer: Signer | undefined,
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amountIn: BigNumber | undefined,
  limitOut?: BigNumber
): () => void {
  const balancerVault = useBalancerVault();
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const { mutate: batchSwapGivenIn } = useSmartContractTransactionPersisted(
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
      amountIn,
      limitOut
    );
    if (callArgs) {
      batchSwapGivenIn(callArgs);
    }
  }, [
    account,
    amountIn,
    batchSwapGivenIn,
    limitOut,
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
  amountIn: BigNumber | undefined,
  limitOut: BigNumber | undefined
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

  // this one is exact since we are doing a SwapKind.GIVEN_IN
  const limitTokenIn = amountIn;

  // this one is seen as a negative delta from the pool's POV.  We can just set this to zero if we
  // don't care about slippage during the transaction.
  const limitTokenOut = limitOut ?? BigNumber.from(0);

  // limits of how much of each token is allowed to be traded.  order must be the same as 'tokens'
  const limits = assets.map((_, index) => {
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
