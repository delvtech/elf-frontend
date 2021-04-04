import { BigNumber } from "ethers";

export type SwapEvent = [
  poolId: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  amountOut: BigNumber
];
