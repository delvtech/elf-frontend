import { getSafeFixedNumber } from "efi/math/fixedPoint";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

/**
 * Given an expected amount out and a tolerance, returns the minimum amount out for a transaction to
 * succeed.
 * @param expectedAmountOut the expected amount out from some amount in
 * @param decimals decimals of the token for expectedAmountOut
 * @param tolerance slippage tolerance for expected amount out.  for 1% this value would be 0.01
 * @returns {BigNumber} the minimum amount out for the transaction to succeed
 */
export function getAmountOutWithTolerance(
  expectedAmountOut: BigNumber | undefined,
  decimals: number | undefined,
  tolerance: number
): BigNumber {
  // this one is exact since we are doing a SwapKind.GIVEN_IN
  // performing a SwapIn, so we can specify a minimum amount out in case price changes from under
  const toleranceFN = getSafeFixedNumber(`${1 - tolerance}`, {
    signed: true,
    decimals,
  });
  const limitTokenOutFN = getSafeFixedNumber(
    formatUnits(expectedAmountOut || "1"),
    {
      signed: true,
      decimals,
    }
  );

  const minAmountOutFN = limitTokenOutFN.mulUnsafe(toleranceFN);
  const minAmountOut = parseUnits(minAmountOutFN.toString(), decimals);

  return minAmountOut;
}
