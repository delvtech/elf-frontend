import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export function validateTradeValues(
  amountIn: string | undefined,
  tokenInBalanceOf: BigNumber | undefined,
  tokenInDecimals: number | undefined,
  tokenInPoolBalance: BigNumber | undefined,
  amountOut: string | undefined,
  tokenOutPoolBalance: BigNumber | undefined
): { isValidTokenInValue: boolean; isValidTokenOutValue: boolean } {
  // input value must be lower than the user's balance and the pool's balance of that token
  const isValidTokenInValue =
    amountIn && tokenInBalanceOf && tokenInPoolBalance
      ? parseUnits(amountIn ?? 0, tokenInDecimals).lte(tokenInBalanceOf) &&
        parseUnits(amountIn ?? 0, tokenInDecimals).lte(tokenInPoolBalance)
      : true;

  // output value must be lower than the pool's balance of that token
  const isValidTokenOutValue =
    amountOut && tokenOutPoolBalance
      ? parseUnits(amountOut ?? 0, tokenInDecimals).lte(tokenOutPoolBalance)
      : true;
  return { isValidTokenInValue, isValidTokenOutValue };
}
