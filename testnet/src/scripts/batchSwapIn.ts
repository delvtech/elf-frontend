import { BytesLike } from "@ethersproject/bytes";
import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Tranche, USDC, Vault, WETH } from "types";

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

async function batchSwapIn(
  baseAssetContract: WETH | USDC,
  trancheContract: Tranche,
  poolId: string,
  sender: string,
  balancerVaultContract: Vault
) {
  const tokens: string[] = [baseAssetContract.address, trancheContract.address];
  const trancheAssetDecimals = await trancheContract.decimals();
  const amountIn = parseUnits("11000", trancheAssetDecimals);
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
  console.log("funds", funds);

  // we are receiving base asset so the delta will be negative, so just set a limit of zero.
  const limitBaseAsset = 0;
  // performing a SwapIn, so we can specifiy exactly how much in and set the limit to that.
  const limitTrancheAsset = amountIn;
  // order must be the same as 'tokens'
  const limits: BigNumberish[] = [limitBaseAsset, limitTrancheAsset];

  // set a five minute deadline.  time is in seconds.  must be an integer.
  // this is actually pretty neat, we can set this when we do trades in the frontend, and set a
  // timer to check on the transaction.
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
