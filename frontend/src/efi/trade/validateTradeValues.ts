import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

export function validateTradeValues(
  amountIn: string | undefined,
  amountOut: string | undefined,
  tokenInPoolBalance: BigNumber | undefined,
  tokenOutPoolBalance: BigNumber | undefined,
  tokenInBalanceOf: BigNumber | undefined,
  tokenInDecimals: number | undefined
): {
  isValidTokenInValue: boolean;
  isValidTokenOutValue: boolean;
  tokenInError?: string;
  tokenOutError?: string;
} {
  // input value must be lower than the user's balance
  let isValidTokenInValue = true;
  let isValidTokenOutValue = true;
  let tokenInError;
  let tokenOutError;

  if (!amountIn || !tokenInBalanceOf || !tokenInPoolBalance) {
    return {
      isValidTokenInValue,
      isValidTokenOutValue,
      tokenInError,
      tokenOutError,
    };
  }

  if (parseUnits(amountIn, tokenInDecimals).gt(tokenInBalanceOf)) {
    isValidTokenInValue = false;
    tokenInError = t`Insufficient balance`;
  }

  if (
    parseUnits(amountOut || "0", tokenInDecimals).gt(tokenOutPoolBalance ?? 0)
  ) {
    isValidTokenOutValue = false;
    tokenOutError = t`Insufficient pool balance`;
  }

  return {
    isValidTokenInValue,
    isValidTokenOutValue,
    tokenInError,
    tokenOutError,
  };
}
