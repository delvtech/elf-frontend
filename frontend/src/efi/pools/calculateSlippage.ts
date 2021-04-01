export function calculateSlippage(
  spotPrice: number,
  amountIn: number,
  amountOut: number
): number {
  const purchasePrice = amountOut / amountIn;
  const priceImpact = purchasePrice / spotPrice;
  const slippagePct = Math.abs(1 - priceImpact);
  return slippagePct;
}
