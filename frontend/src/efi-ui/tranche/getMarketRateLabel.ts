import { t } from "ttag";

export function getMarketRateLabel(
  inputTokenSymbol: string | undefined,
  roundedTranchePrice: string | undefined,
  activeBaseAssetSymbol: string | undefined
): string | undefined {
  if (!inputTokenSymbol || !roundedTranchePrice || !activeBaseAssetSymbol) {
    return;
  }
  return t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedTranchePrice} ${activeBaseAssetSymbol}`;
}
