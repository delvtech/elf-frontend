import { TokenInfo } from "@elementfi/tokenlist";
import { getZappableTokenInfosForUnderlying } from "elf/zaps/zapPurchase/zapPurchase";
import { getTokenInfo } from "tokenlists/tokenlists";

export function useFixedRateInputTokens(
  underlyingAddress: string
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(underlyingAddress);
  const zappableTokenInfos =
    getZappableTokenInfosForUnderlying(underlyingAddress);
  return [underlyingTokenInfo, ...zappableTokenInfos];
}
