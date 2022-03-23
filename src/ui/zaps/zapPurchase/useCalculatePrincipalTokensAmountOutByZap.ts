import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
export function useCalculatePrincipalTokensAmountOutByZap(
  principalToken: PrincipalTokenInfo,
  inputToken: TokenInfo,
  account: string,
  amountIn: string
): { amountOut: string; error: boolean } {
  return { amountOut: "", error: false };
}
