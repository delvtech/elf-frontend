import { BigNumber } from "ethers";

interface ParsedQueryBatchSwapResult {
  tokenOut: BigNumber | undefined;
  tokenIn: BigNumber | undefined;
}

export function parseQueryBatchSwapResult(
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined,
  batchSwaps: BigNumber[] | undefined
): ParsedQueryBatchSwapResult {
  const sortedAssets = [tokenInAddress, tokenOutAddress].sort();
  const tokenInIndex = sortedAssets.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = sortedAssets.findIndex(
    (address) => address === tokenOutAddress
  );
  const tokenIn = batchSwaps?.[tokenInIndex];
  const tokenOut = batchSwaps?.[tokenOutIndex];

  return { tokenOut, tokenIn };
}
