import { BytesLike } from "@ethersproject/bytes";
import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ERC20, Vault } from "types";

import { ONE_DAY_IN_SECONDS } from "../time";

interface SwapIn {
  poolId: BytesLike;
  tokenInIndex: number;
  tokenOutIndex: number;
  amountIn: BigNumberish;
  userData: BytesLike;
}
interface FundManagement {
  sender: string;
  fromInternalBalance: boolean;
  recipient: string;
  toInternalBalance: boolean;
}

export async function batchSwapIn(
  tokenOutContract: ERC20,
  tokenInContract: ERC20,
  poolId: string,
  sender: string,
  balancerVaultContract: Vault,
  swapInAmount: string
) {
  const tokens: string[] = [tokenOutContract.address, tokenInContract.address];
  const tokenInDecimals = await tokenInContract.decimals();
  const amountIn = parseUnits(swapInAmount, tokenInDecimals);
  // have to set this to something
  const userData: BytesLike = poolId;

  // the series of swaps to perform, only one in this case.
  const swaps: SwapIn[] = [
    {
      poolId,
      // indicies from 'tokens', puttin FYTs in, getting base asset out.
      tokenInIndex: 1,
      tokenOutIndex: 0,
      amountIn,
      userData,
    },
  ];

  // trading with ourselves.  internal balance means internal to balancer.  we don't have anything
  // in there to start, but we'll keep whatever base assets we get from swapping in the balancer vault.
  const funds: FundManagement = {
    sender,
    fromInternalBalance: false,
    recipient: sender,
    toInternalBalance: true,
  };

  // the user is sending this one, so the delta will be negative, so just set a limit of zero.
  const limitTokenIn = 0;

  // performing a SwapIn, so we can specifiy exactly how much in and set the limit to that.
  const limitTokenOut = amountIn;

  // limits of how much of each token is allowed to be traded.  order must be the same as 'tokens'
  const limits: BigNumberish[] = [limitTokenIn, limitTokenOut];

  // set a large deadline for now, it was being buggy.  time is in seconds.  must be an integer.
  const deadline = Math.round(Date.now() / 1000) + ONE_DAY_IN_SECONDS;

  const swapReceipt = await balancerVaultContract.batchSwapGivenIn(
    swaps,
    tokens,
    funds,
    limits,
    deadline
  );

  await swapReceipt.wait(1);
  return swapReceipt;
}
