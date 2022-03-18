import {
  CurvePoolWith2Tokens,
  CurvePoolWith2Tokens__factory,
  CurvePoolWith3Tokens,
  CurvePoolWith3Tokens__factory,
} from "@elementfi/core-typechain/dist/libraries";
import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
  TokenTag,
} from "@elementfi/tokenlist";
import { defaultProvider } from "elf/providers/providers";
import { getTokenInfo } from "tokenlists/tokenlists";

export function underlyingIsCurveLpToken(
  tokenInfo: PrincipalTokenInfo
): boolean {
  const underlyingTokenInfo = getTokenInfo(tokenInfo.extensions.underlying);
  return isCurveLpToken(underlyingTokenInfo);
}

export function isCurveLpToken(
  tokenInfo: TokenInfo
): tokenInfo is CurveLpTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenTag.CURVE);
}

// TODO Make this a switch case for each individual token
export function getCurvePoolContractByCurveLpToken(
  tokenInfo: CurveLpTokenInfo
): CurvePoolWith2Tokens | CurvePoolWith3Tokens {
  return tokenInfo.extensions.poolAssets.length === 2
    ? CurvePoolWith2Tokens__factory.connect(
        tokenInfo.extensions.pool,
        defaultProvider
      )
    : CurvePoolWith3Tokens__factory.connect(
        tokenInfo.extensions.pool,
        defaultProvider
      );
}

export function getCurvePoolTokensByCurveLpToken(
  tokenInfo: CurveLpTokenInfo
): TokenInfo[] {
  return tokenInfo.extensions.poolAssets.map(getTokenInfo);
}

export function isTokenInCurvePoolOfCurveLpToken(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo
): boolean {
  return getCurvePoolTokensByCurveLpToken(curveLpToken)
    .map(({ address }) => address)
    .includes(token.address);
}

export function getIdxOfTokenInCurvePool(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo
): number | undefined {
  const index = curveLpToken.extensions.poolAssets.findIndex(
    (address) => address === token.address
  );
  return index >= 0 ? index : undefined;
}

export function getCurvePoolTokensByPrincipalToken(
  tokenInfo: PrincipalTokenInfo
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(tokenInfo.extensions.underlying);

  if (!isCurveLpToken(underlyingTokenInfo)) return [];

  const baseCurvePoolTokens =
    getCurvePoolTokensByCurveLpToken(underlyingTokenInfo);

  const metaCurvePoolTokens = baseCurvePoolTokens
    .filter(isCurveLpToken)
    .map(getCurvePoolTokensByCurveLpToken)
    .flat();

  return [...baseCurvePoolTokens, ...metaCurvePoolTokens];
}
