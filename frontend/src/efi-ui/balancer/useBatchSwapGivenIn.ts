import { useCallback } from "react";

import { ERC20 } from "elf-contracts/types/ERC20";
import { Vault } from "elf-contracts/types/Vault";
import { BigNumber, Signer } from "ethers";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { ContractMethodArgs } from "efi/contracts/types";
import { PoolContract } from "efi/pools/PoolContract";

export function useBatchSwapGivenIn(
  account: string | null | undefined,
  signer: Signer | undefined,
  pool: PoolContract | undefined,
  tokenIn: ERC20 | undefined,
  // TODO: Make this a string instead, eg: "2.1234"
  amount: BigNumber | undefined
): () => void {
  const balancerVault = useBalancerVault();
  const poolIdResult = useSmartContractReadCall(pool, "getPoolId");
  const poolId = getQueryData(poolIdResult);

  const tokenOut = usePoolPairedToken(pool, tokenIn);
  const { mutate: batchSwapGivenIn } = useSmartContractTransaction(
    balancerVault,
    "batchSwapGivenIn",
    signer
  );

  const onSwapGivenInTransaction = useCallback(() => {
    const callArgs = makeBatchSwapGivenInCallArgs(
      account,
      poolId,
      tokenIn,
      tokenOut,
      amount
    );
    if (callArgs) {
      batchSwapGivenIn(callArgs);
    }
  }, [account, amount, batchSwapGivenIn, poolId, tokenIn, tokenOut]);

  return onSwapGivenInTransaction;
}

function makeBatchSwapGivenInCallArgs(
  account: string | null | undefined,
  poolId: string | undefined,
  tokenIn: ERC20 | undefined,
  tokenOut: ERC20 | undefined,
  amountIn: BigNumber | undefined
): ContractMethodArgs<Vault, "batchSwapGivenIn"> | undefined {
  if (!account || !poolId || !tokenIn || !tokenOut || !amountIn) {
    return;
  }

  const tokens = [tokenIn.address, tokenOut.address];
  const userData = poolId;
  const swaps = [
    {
      poolId,
      // indicies from 'tokens', puttin FYTs in, getting base asset out.
      tokenInIndex: 0,
      tokenOutIndex: 1,
      amountIn,
      userData,
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
  const limits = [limitTokenIn, limitTokenOut];

  // set a large deadline for now, it was being buggy.  time is in seconds.  must be an integer.
  const deadline = Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS;

  const callArgs: ContractMethodArgs<Vault, "batchSwapGivenIn"> = [
    swaps,
    tokens,
    funds,
    limits,
    deadline,
  ];

  return callArgs;
}
