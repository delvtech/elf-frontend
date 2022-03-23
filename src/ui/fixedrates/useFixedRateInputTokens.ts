import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { getCurvePoolTokensByPrincipalToken } from "elf/curve/tokens";
import { useMemo } from "react";
import { getTokenInfo } from "tokenlists/tokenlists";

export function useFixedRateInputTokens(
  principalTokenInfo: PrincipalTokenInfo
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(
    principalTokenInfo.extensions.underlying
  );
  const curvePoolTokenInfos = useMemo(
    () => getCurvePoolTokensByPrincipalToken(principalTokenInfo),
    [principalTokenInfo]
  );
  return [underlyingTokenInfo, ...curvePoolTokenInfos];
}
