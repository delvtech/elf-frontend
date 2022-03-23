import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
  TokenTag,
} from "@elementfi/tokenlist";
import { getTokenInfo } from "tokenlists/tokenlists";
export type CurvePoolTokenInfo = TokenInfo & {
  readonly CurvePoolToken: unique symbol;
};

export function isCurveLpToken(
  tokenInfo: TokenInfo
): tokenInfo is CurveLpTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenTag.CURVE);
}

export function getCurvePoolTokensByCurveLpToken(
  tokenInfo: CurveLpTokenInfo
): TokenInfo[] {
  return tokenInfo.extensions.poolAssets.map(getTokenInfo);
}

// Returns the constituent tokenInfos of the tokens which are members of curve
// pools related to the underlying principal token address.
//
// e.g The MIM-3LP principal token uses an underying token of the same name, its
// corresponding pool has token members, MIM and 3CRV. As 3CRV is also a curve lp
// token, we also find the members of its pool, DAI, USDC, and USDT
//
// Visually the hierarchy follows three cases:
//
// 1) CurveLpTokenA :: STECRV
//      - CurvePoolTokenA :: ETH
//      - CurvePoolTokenB :: STETH
//
// 2) CurveLpTokenA :: CRVTRICRYPTO
//      - CurvePoolTokenA :: USDT
//      - CurvePoolTokenB :: WBTC
//      - CurvePoolTokenC :: ETH
//
// 3) CurveLpTokenA :: MIM-3LP
//      - CurvePoolTokenA :: MIM
//      - CurveLpTokenB   :: 3CRV
//          - CurvePoolTokenB :: DAI
//          - CurvePoolTokenC :: USDC
//          - CurvePoolTokenD :: USDT
//
export function getCurvePoolTokensByPrincipalToken(
  principalTokenInfo: PrincipalTokenInfo
): TokenInfo[] {
  const underlyingTokenInfo = getTokenInfo(
    principalTokenInfo.extensions.underlying
  );

  if (!isCurveLpToken(underlyingTokenInfo)) return [];

  const baseCurvePoolTokens =
    getCurvePoolTokensByCurveLpToken(underlyingTokenInfo);

  const metaCurvePoolTokens = baseCurvePoolTokens
    .filter(isCurveLpToken)
    .map(getCurvePoolTokensByCurveLpToken)
    .flat();

  return [...baseCurvePoolTokens, ...metaCurvePoolTokens];
}
