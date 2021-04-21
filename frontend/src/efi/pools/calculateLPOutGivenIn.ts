import { FixedNumber } from "ethers";
// import { FixedFormat } from "@ethersproject/bignumber";
import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";

export interface LPOutGivenTokenIn {
  otherNeeded: number;
  givenInNeeded: number;
  lpOut: number;
}

export function calculateLPOutGivenIn(
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
  givenInNeeded: string;
  lpOut: string;
}

export function calculateLPOutGivenInFixed(
  yIn: string, // y value, bond
  // yDecimals: number,
  xIn: string, // x value, base
  // xDecimals: number,
  yReserves: string,
  xReserves: string,
  tokenDecimals: number,
  totalSupply: string // lp tokens
  // supplyDecimals: number
): LPOutGivenTokenInFixed {
  console.log("yIn", yIn);
  console.log("xIn", xIn);
  console.log("yReserves", yReserves);
  console.log("xReserves", xReserves);
  console.log("totalSupply", totalSupply);

  // might need this for 6 point decimal things and then need to upscale
  // const assetFormat = {
  //   decimals: 18,
  //   signed: false,
  //   width: 256,
  //   name: "asset",
  //   _multiplier: "1",
  // };

  const bpt = {
    decimals: BALANCER_POOL_LP_TOKEN_DECIMALS,
    signed: false,
    width: 256,
    name: "BPT",
    _multiplier: "1",
  };

  const _yIn = FixedNumber.fromString(yIn, bpt);
  const _xIn = FixedNumber.fromString(xIn, bpt);
  const _xReserves = FixedNumber.fromString(xReserves, bpt);
  const _yReserves = FixedNumber.fromString(yReserves, bpt);
  const _totalSupply = FixedNumber.fromString(totalSupply, bpt);
  console.log("_xIn", _xIn.toString());
  console.log("_yIn", _yIn.toString());
  console.log("_xReserves", _xReserves.toString());
  console.log("_yReserves", _yReserves.toString());
  console.log("_xIn < _yIn", _xIn < _yIn);
  console.log("_xIn > _yIn", _xIn > _yIn);
  console.log("_xReserves < _yReserves", _xReserves < _yReserves);
  console.log("_xReserves > _yReserves", _xReserves > _yReserves);
  console.log("_totalSupply", _totalSupply.toString());

  // Check if the pool is initialized
  if (_totalSupply.isZero()) {
    // When uninitialized we mint exactly the underlying input in LP tokens
    const lpOut = _xIn.round(tokenDecimals).toString();
    const otherNeeded = _xIn.round(tokenDecimals).toString();
    const givenInNeeded = "0";
    return { otherNeeded, givenInNeeded, lpOut };
  }

  // calc the number of x needed for the y_in provided
  let _otherNeeded = _yReserves.divUnsafe(_xReserves).mulUnsafe(_yIn);
  console.log("otherNeeded", _otherNeeded.toString());
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

    const otherNeeded = _otherNeeded.round(tokenDecimals).toString();
    const givenInNeeded = _givenInNeeded.round(tokenDecimals).toString();
    const lpOut = _lpOut.toString();
    return { otherNeeded, givenInNeeded, lpOut };
  }

  // We calculate the percent increase in the reserves from contributing all of the bond
  const _lpOut = _otherNeeded.mulUnsafe(_totalSupply).divUnsafe(_yReserves);

  const otherNeeded = _otherNeeded.round(tokenDecimals).toString();
  const givenInNeeded = _yIn.round(tokenDecimals).toString();
  const lpOut = _lpOut.toString();
  return { otherNeeded, givenInNeeded, lpOut };
}
