import {
  clipFixNumberToStringDecimals,
  getSafeFixedNumber,
} from "efi/math/fixedPoint";

export interface LPOutGivenTokenIn {
  otherNeeded: number;
  givenInNeeded: number;
  lpOut: number;
}

/**
 * @deprecated this will return inexact results which lead to dust problems when joining a CCPool
 * @param givenInAmount
 * @param maxOther
 * @param givenInReserves
 * @param otherReserves
 * @param totalSupply
 * @returns
 */
export function calculateLPOutGivenInUNSAFE(
  givenInAmount: number,
  maxOther: number,
  givenInReserves: number,
  otherReserves: number,
  totalSupply: number
): LPOutGivenTokenIn {
  // Check if the pool is initialized
  if (totalSupply === 0) {
    // When uninitialized we mint exactly the underlying input in LP tokens
    const lpOut = maxOther;
    const otherNeeded = maxOther;
    const givenInNeeded = 0;
    return { otherNeeded, givenInNeeded, lpOut };
  }

  // calc the number of x needed for the y_in provided
  let otherNeeded = (givenInReserves / otherReserves) * givenInAmount;
  // if there isn't enough x_in provided
  if (otherNeeded > maxOther) {
    const lpOut = (maxOther * totalSupply) / givenInReserves;

    // use all the x_in
    otherNeeded = maxOther;
    // solve for: x_reserves/y_reserves = x_needed/y_needed
    const givenInNeeded = otherNeeded / (givenInReserves / otherReserves);

    return { otherNeeded, givenInNeeded, lpOut };
  }

  // We calculate the percent increase in the reserves from contributing all of the bond
  const lpOut = (otherNeeded * totalSupply) / givenInReserves;
  const givenInNeeded = givenInAmount;
  return { otherNeeded, givenInNeeded, lpOut };
}

export interface LPOutGivenTokenInFixed {
  otherNeeded: string;
  givenInNeeded: string | undefined;
  lpOut: string | undefined;
}

export function calculateLPOutGivenInFixed(
  yIn: string, // given token
  yReserves: string,
  xReserves: string,
  totalSupply: string, // lp tokens, always 18 point decimal
  tokenDecimals: number
): LPOutGivenTokenInFixed {
  const _yIn = getSafeFixedNumber(yIn);
  const _xReserves = getSafeFixedNumber(xReserves);
  const _yReserves = getSafeFixedNumber(yReserves);
  const _totalSupply = getSafeFixedNumber(totalSupply);

  // Check if the pool is initialized
  if (_totalSupply.isZero()) {
    // When uninitialized we mint exactly the underlying input in LP tokens
    const lpOut = _yIn.toString();
    const otherNeeded = clipFixNumberToStringDecimals(_yIn, tokenDecimals);
    const givenInNeeded = "0";
    return { otherNeeded, givenInNeeded, lpOut };
  }

  const _reservesRatio = _yReserves.divUnsafe(_xReserves);
  const _givenInNeeded = _yIn;
  const _otherNeeded = _yIn.divUnsafe(_reservesRatio);

  // CCPool will make lpOut the lesser of xIn/xReserves or yIn/yReserves.  Since we are just making
  // the ratios match exactly we can just use yIn/yReserves.
  const _lpOut = _yIn.divUnsafe(_yReserves);

  const otherNeeded = clipFixNumberToStringDecimals(
    _otherNeeded,
    tokenDecimals
  );

  const givenInNeeded = clipFixNumberToStringDecimals(
    _givenInNeeded,
    tokenDecimals
  );
  const lpOut = _lpOut.toString();

  return { otherNeeded, givenInNeeded, lpOut };
}
