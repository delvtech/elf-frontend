import { CurveLpTokenInfo, TokenInfo, TokenTag } from "@elementfi/tokenlist";
import { getTokenInfo } from "tokenlists/tokenlists";

export function isCurveLpTokenInfo(
  tokenInfo: TokenInfo
): tokenInfo is CurveLpTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenTag.CURVE);
}

function getPoolAssetTokenInfosForCurveLpTokenInfo(
  tokenInfo: CurveLpTokenInfo
) {
  return tokenInfo.extensions.poolAssets.map(getTokenInfo);
}

// Returns the constituent pool tokens if the underlying token is a curve lp
// token. This also includes the tokens of a metapool should one of the pool
// tokens for pool of underlying is also an lp token. e.g MIM-3-LP uses 3CRV
export function getZappableTokenInfosForUnderlying(
  underlyingAddress: string
): TokenInfo[] {
  const underlyingCurveTokenInfo = getTokenInfo(underlyingAddress);

  if (!isCurveLpTokenInfo(underlyingCurveTokenInfo)) return [];

  const poolAssetTokenInfos = getPoolAssetTokenInfosForCurveLpTokenInfo(
    underlyingCurveTokenInfo
  );

  const poolAssetCurveLpTokenInfos =
    poolAssetTokenInfos.filter(isCurveLpTokenInfo);

  const metaPoolAssetTokenInfo =
    poolAssetCurveLpTokenInfos.length === 1
      ? getPoolAssetTokenInfosForCurveLpTokenInfo(poolAssetCurveLpTokenInfos[0])
      : [];
  return [...poolAssetTokenInfos, ...metaPoolAssetTokenInfo];
}
