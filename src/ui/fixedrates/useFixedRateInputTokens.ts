import { TokenInfo } from "@elementfi/tokenlist";
import { getZappableTokenInfosForUnderlying } from "elf/zaps/zapPurchase/zapPurchase";
import { useMemo } from "react";
import { getTokenInfo } from "tokenlists/tokenlists";

export function useFixedRateInputTokens(
  underlyingAddress: string,
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(underlyingAddress);
  const zappableTokenInfos = useMemo(
    () => getZappableTokenInfosForUnderlying(underlyingAddress),
    [underlyingAddress],
  );
  return [underlyingTokenInfo, ...zappableTokenInfos];
}
