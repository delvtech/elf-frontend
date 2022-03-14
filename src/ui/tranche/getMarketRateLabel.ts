import { t } from "ttag";

export function getMarketRateLabel(
  baseAssetSymbol: string | undefined,
  roundedTranchePrice: string | undefined,
  inputAssetSymbol: string | undefined
): string | undefined {
  if (!baseAssetSymbol || !roundedTranchePrice || !inputAssetSymbol) {
    return;
  }
  return t`1 ${baseAssetSymbol} Principal Token ≈ ${roundedTranchePrice} ${inputAssetSymbol}`;
}
