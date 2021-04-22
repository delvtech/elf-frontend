import {
  clipFixNumberToStringDecimals,
  getSafeFixedNumber,
} from "efi/math/fixedPoint";

/**
 * calculates the tokens that would be recieved for an exact amount of LP in.  uses fixedpoint math
 * to be as accurate as possible
 * @param lpIn lp tokens into the pool to get tokens out
 * @param xReserves the base asset
 * @param yReserves the bond asset
 * @param totalSupply total supply of lp tokens
 * @param decimals decimals of the tokens in the pool (must be the same)
 * @returns string values of xNeeded and yNeeded with a maximum number decimals of the tokens
 */
export function calculateTokensOutForLPInFixed(
  lpIn: string | undefined,
  xReserves: string | undefined,
  yReserves: string | undefined,
  totalSupply: string | undefined,
  tokenDecimals: number | undefined
): { xNeeded: string | undefined; yNeeded: string | undefined } {
  if (!lpIn || !xReserves || !yReserves || !totalSupply || !tokenDecimals) {
    return { xNeeded: undefined, yNeeded: undefined };
  }

  const _lpIn = getSafeFixedNumber(lpIn);
  const _xReserves = getSafeFixedNumber(xReserves);
  const _yReserves = getSafeFixedNumber(yReserves);
  const _totalSupply = getSafeFixedNumber(totalSupply);

  const _lpShare = _lpIn.divUnsafe(_totalSupply);

  const _yNeeded = _lpShare.mulUnsafe(_yReserves);
  const _xNeeded = _lpShare.mulUnsafe(_xReserves);

  const xNeeded = clipFixNumberToStringDecimals(_xNeeded, tokenDecimals);
  const yNeeded = clipFixNumberToStringDecimals(_yNeeded, tokenDecimals);

  return { xNeeded, yNeeded };
}
