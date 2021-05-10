import { BigNumber } from "ethers";

import {
  BALANCER_ETH_SENTINEL,
  mapETHSentinalToWETH,
  mapWETHToETHSentinal,
} from "efi/balancer";

interface ParsedQueryBatchSwapResult {
  tokenOut: BigNumber | undefined;
  tokenIn: BigNumber | undefined;
}

export function parseQueryBatchSwapResult(
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  batchSwaps: BigNumber[] | undefined
): ParsedQueryBatchSwapResult {
  if (!tokenInAddress || !tokenOutAddress) {
    return { tokenIn: undefined, tokenOut: undefined };
  }

  // balancer's batchSwap requires that the assets be sorted
  let assets = [tokenInAddress, tokenOutAddress].sort();
  // ETH is a special case. Balancer uses the
  // zero address as an address sentinel for ETH, but still expects the addresses sorted as though
  // it were WETH.
  if (assets.includes(BALANCER_ETH_SENTINEL)) {
    assets = assets.map(mapETHSentinalToWETH).sort().map(mapWETHToETHSentinal);
  }
  const tokenInIndex = assets.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = assets.findIndex(
    (address) => address === tokenOutAddress
  );
  const tokenIn = batchSwaps?.[tokenInIndex];
  const tokenOut = batchSwaps?.[tokenOutIndex];

  return { tokenOut, tokenIn };
}
