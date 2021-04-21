import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

export function validateStakingValue(
  amount: string | undefined,
  tokenBalanceOf: BigNumber | undefined,
  tokenDecimals: number | undefined,
  tokenPoolBalance: BigNumber | undefined
): boolean {
  const isValidTokenValue =
    amount && tokenBalanceOf && tokenPoolBalance
      ? parseUnits(amount ?? 0, tokenDecimals).lte(tokenBalanceOf) &&
        parseUnits(amount ?? 0, tokenDecimals).lte(tokenPoolBalance)
      : true;

  return isValidTokenValue;
}
