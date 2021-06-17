import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Vault } from "elf-contracts/types/Vault";
import {
  BigNumber,
  BytesLike,
  ContractReceipt,
  PayableOverrides,
  Signer,
} from "ethers";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { BatchSwapStep } from "efi-ui/balancer/SwapRequest";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import {
  AppToaster,
  makeErrorToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import {
  BALANCER_ETH_SENTINEL,
  mapETHSentinalToWETH,
  mapWETHToETHSentinal,
} from "efi/balancer";
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
  limitOut?: BigNumber,
  onTransactionStarted?: () => void
): {
  batchSwapGivenIn: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<Vault["batchSwap"]>
  >;
} {
  const balancerVault = useBalancerVault();
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const mutationResult = useSmartContractTransactionPersisted(
    balancerVault,
    "batchSwap",
    signer,
    {
      onTransactionSubmitted: () => {
        onTransactionStarted?.();
      },
      onError: (error) => {
        AppToaster.show(makeErrorToast(error.message));
      },
    }
  );

  const { mutate: batchSwapGivenIn } = mutationResult;
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

  return { batchSwapGivenIn: onSwapGivenInTransaction, mutationResult };
}

function makeBatchSwapGivenInCallArgs(
  account: string | null | undefined,
  poolId: BytesLike | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  amount: BigNumber | undefined,
  limitOut: BigNumber | undefined
): ContractMethodArgs<Vault, "batchSwap"> | undefined {
  if (!account || !poolId || !tokenInAddress || !tokenOutAddress || !amount) {
    return;
  }

  // balancer's batchSwap requires that the assets be sorted
  let assets = [tokenInAddress, tokenOutAddress].sort();
  // ETH is a special case. Balancer uses the
  // zero address as an address sentinel for ETH, but still expects the addresses sorted as though
  // it were WETH.
  if (assets.includes(BALANCER_ETH_SENTINEL)) {
    assets = assets.map(mapETHSentinalToWETH).sort().map(mapWETHToETHSentinal);
  }

  const assetInIndex = assets.findIndex(
    (address) => address === tokenInAddress
  );
  const assetOutIndex = assets.findIndex(
    (address) => address === tokenOutAddress
  );

  const swaps: BatchSwapStep[] = [
    {
      poolId,
      assetInIndex,
      assetOutIndex,
      amount,
      // no need to pass data
      userData: "0x00",
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
  const limitTokenIn = amount;

  // this one is seen as a negative delta from the pool's POV.  We can just set this to zero if we
  // don't care about slippage during the transaction.
  const limitTokenOut = limitOut ?? BigNumber.from(0);

  // limits of how much of each token is allowed to be traded.  order must be the same as 'tokens'
  const limits = assets.map((_, index) => {
    if (index === assetInIndex) {
      return limitTokenIn;
    }
    if (index === assetOutIndex) {
      return limitTokenOut;
    }
    // this should never happen but is here for completeness
    return BigNumber.from(0);
  }) as BigNumber[];

  // set a large deadline for now, it was being buggy.  time is in seconds.  must be an integer.
  const deadline = Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS;

  const callArgs: ContractMethodArgs<Vault, "batchSwap"> = [
    SwapKind.GIVEN_IN,
    swaps,
    assets,
    funds,
    limits,
    deadline,
  ];
  if (tokenInAddress === BALANCER_ETH_SENTINEL) {
    const overrides: PayableOverrides = { value: amount };
    callArgs.push(overrides);
  }

  return callArgs;
}
