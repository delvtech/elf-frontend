import { YieldTokenInfo } from "tokenlists/types";

export function formatYieldTokenShortSymbol(
  yieldToken: YieldTokenInfo
): string {
  const { symbol } = yieldToken;
  // symbols look like: `eYyvCurveLUSD-12SEP21
  const [elementSymbol, unusedElementTermDate] = symbol.split("-");
  return elementSymbol;
}
