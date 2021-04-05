import { BytesLike } from "@ethersproject/bytes";
import { BigNumber, BigNumberish, PayableOverrides } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";

import { ERC20 } from "src/types/ERC20";
import { Vault } from "src/types/Vault";

import { ONE_DAY_IN_SECONDS } from "src/time";

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
  tokenInContract: ERC20,
  tokenOutContract: ERC20,
  poolId: string,
  sender: string,
  balancerVaultContract: Vault,
  swapInAmount: string,
  decimals?: number
) {
  const tokenInAddress = tokenInContract.address;
  const tokenOutAddress = tokenOutContract.address;

  let tokenInDecimals = decimals;
  if (!decimals) {
    tokenInDecimals = await tokenInContract.decimals();
  }

  const tokens: string[] = [tokenInAddress, tokenOutAddress].sort();
  const tokenInIndex = tokens.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = tokens.findIndex(
    (address) => address === tokenOutAddress
  );
  const amountIn = parseUnits(swapInAmount, tokenInDecimals);
  // have to set this to something
  const userData: BytesLike = poolId;

  // the series of swaps to perform, only one in this case.
  const swaps: SwapIn[] = [
    {
      poolId,
      // indicies from 'tokens', puttin FYTs in, getting base asset out.
      tokenInIndex,
      tokenOutIndex,
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
    toInternalBalance: false,
  };

  // the user is sending this one, so the delta will be negative, so just set a limit of zero.
  const limitTokenIn = amountIn;

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
