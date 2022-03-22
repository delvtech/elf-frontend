import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
  TokenTag,
} from "@elementfi/tokenlist";
import { getTokenInfo } from "tokenlists/tokenlists";

export function isCurveLpToken(
  tokenInfo: TokenInfo
): tokenInfo is CurveLpTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenTag.CURVE);
}

export function getCurvePoolTokensByPrincipalToken(
  tokenInfo: PrincipalTokenInfo
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(tokenInfo.extensions.underlying);

  if (!isCurveLpToken(underlyingTokenInfo)) return [];

  const baseCurvePoolTokens =
    underlyingTokenInfo.extensions.poolAssets.map(getTokenInfo);

  const metaCurvePoolTokens = baseCurvePoolTokens
    .filter(isCurveLpToken)
    .map((token) => token.extensions.poolAssets.map(getTokenInfo))
    .flat();

  return [...baseCurvePoolTokens, ...metaCurvePoolTokens];
}
