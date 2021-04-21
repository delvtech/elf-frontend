// TODO: Improve this with Fixed Point math as it currently creates "dust"
// because of how javascript handles numbers.
export function calculateTokensOutForLPIn(
  lpIn: number,
  xReserves: number,
  yReserves: number,
  totalSupply: number
): { xNeeded: number; yNeeded: number } {
  // solve for y_needed: lp_out = ((x_reserves / y_reserves) * y_needed * total_supply)/x_reserves
  const yNeeded = (lpIn * xReserves) / ((xReserves / yReserves) * totalSupply);
  // solve for x_needed: x_reserves/y_reserves = x_needed/y_needed
  const xNeeded = (xReserves / yReserves) * yNeeded;
  return { xNeeded, yNeeded };
}
