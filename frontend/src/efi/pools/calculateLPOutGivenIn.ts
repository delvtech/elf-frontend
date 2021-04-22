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
  otherNeeded: string | undefined;
  givenInNeeded: string | undefined;
  lpOut: string | undefined;
}

export function calculateLPOutGivenInFixed(
  yIn: string, // y value, bond
  xIn: string, // x value, base
  yReserves: string,
  xReserves: string,
  tokenDecimals: number,
  totalSupply: string // lp tokens, always 18 point decimal
): LPOutGivenTokenInFixed {
  const _yIn = getSafeFixedNumber(yIn);
  const _xIn = getSafeFixedNumber(xIn);
  const _xReserves = getSafeFixedNumber(xReserves);
  const _yReserves = getSafeFixedNumber(yReserves);
  const _totalSupply = getSafeFixedNumber(totalSupply);

  // Check if the pool is initialized
  if (_totalSupply.isZero()) {
    // When uninitialized we mint exactly the underlying input in LP tokens
    const lpOut = clipFixNumberToStringDecimals(_xIn, tokenDecimals);
    const otherNeeded = clipFixNumberToStringDecimals(_xIn, tokenDecimals);
    const givenInNeeded = "0";
    return { otherNeeded, givenInNeeded, lpOut };
  }

  // calc the number of x needed for the y_in provided
  let _otherNeeded = _yReserves.divUnsafe(_xReserves).mulUnsafe(_yIn);
  // if there isn't enough x_in provided
  if (_otherNeeded > _xIn) {
    const _lpOut = _xIn.mulUnsafe(_totalSupply).divUnsafe(_yReserves);

    // use all the x_in
    _otherNeeded = _xIn;
    // solve for: x_reserves/y_reserves = x_needed/y_needed
    // givenInNeeded = otherNeeded / (yReserves / xReserves)
    const _givenInNeeded = _otherNeeded.divUnsafe(
      _yReserves.divUnsafe(_xReserves)
    );

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

  // We calculate the percent increase in the reserves from contributing all of the bond
  const _lpOut = _otherNeeded.mulUnsafe(_totalSupply).divUnsafe(_yReserves);

  const otherNeeded = clipFixNumberToStringDecimals(
    _otherNeeded,
    tokenDecimals
  );
  const givenInNeeded = clipFixNumberToStringDecimals(_yIn, tokenDecimals);
  const lpOut = _lpOut.toString();
  return { otherNeeded, givenInNeeded, lpOut };
}
