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

// const y_reserves = 674971.6048091053;
// const x_reserves = 252853.96590876798;
// const total_supply = 888791.4151192267;
// const yIn = 2;
// const xIn = 99999999;
// console.log(yIn, xIn);
// const {
//   otherNeeded: xNeeded,
//   givenInNeeded: yNeeded,
//   lpOut,
// } = calculateLPOutGivenIn(yIn, xIn, x_reserves, y_reserves, total_supply);

// console.log("result", yNeeded, xNeeded, lpOut);
