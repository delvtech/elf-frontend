import { TokenTag, TokenInfo, CurveLpTokenInfo } from "@elementfi/tokenlist";
import { tokenListJson } from "tokenlists/tokenlists";

export function isCurveLpTokenInfo(
  tokenInfo: TokenInfo
): tokenInfo is CurveLpTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenTag.CURVE);
}

const curveLpTokenInfos = tokenListJson.tokens.filter(isCurveLpTokenInfo);

function getPoolAssetTokenInfosForCurveLpTokenInfo(
  tokenInfo: CurveLpTokenInfo
) {
  return tokenInfo.extensions.poolAssets
    .map((assetAddress) => {
      return tokenListJson.tokens.find(
        (tokenInfo) => tokenInfo.address === assetAddress
      );
    })
    .filter((info): info is TokenInfo => !!info);
}

// Returns the constituent pool tokens if the underlying token is a curve lp
// token. This also includes the tokens of a metapool should one of the pool
// tokens for pool of underlying is also an lp token. e.g MIM-3-LP uses 3CRV
export function getZappableTokenInfosForUnderlying(
  underlyingAddress: string
): TokenInfo[] {
  const underlyingCurveTokenInfo = curveLpTokenInfos.find(
    ({ address }) => address === underlyingAddress
  );

  if (!underlyingCurveTokenInfo) return [];

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
