import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { getCurvePoolTokensByPrincipalToken } from "elf/curve/tokens";
import { getTokenInfo } from "tokenlists/tokenlists";

export function getFixedRateInputTokens(
  principalTokenInfo: PrincipalTokenInfo,
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(
    principalTokenInfo.extensions.underlying,
  );
  const curvePoolTokenInfos =
    getCurvePoolTokensByPrincipalToken(principalTokenInfo);

  return [underlyingTokenInfo, ...curvePoolTokenInfos];
}
