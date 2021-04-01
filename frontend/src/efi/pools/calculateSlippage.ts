export function calculateSlippage(
  spotPrice: number,
  purchasePrice: number
): number {
  const priceImpact = purchasePrice / spotPrice;
  const slippagePct = Math.abs(1 - priceImpact);
  return slippagePct;
}
