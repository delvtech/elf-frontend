import { t } from "ttag";

export function getMarketRateLabel(
  baseAssetSymbol: string,
  roundedTranchePrice: string,
  inputAssetSymbol: string
): string {
  return t`1 ${baseAssetSymbol} Principal Token ≈ ${roundedTranchePrice} ${inputAssetSymbol}`;
}
