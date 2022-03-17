import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
} from "@elementfi/tokenlist";
import {
  getCurvePoolTokensByCurveLpToken,
  getCurvePoolTokensByPrincipalToken,
  isCurveLpToken,
  isTokenInCurvePoolOfCurveLpToken,
  underlyingIsCurveLpToken,
} from "elf/curve/tokens";
import { getTokenInfo } from "tokenlists/tokenlists";

// token -> base -> principal
// token -> meta -> base -> principal
export interface ZapPurchaseTokenGraph {
  token: TokenInfo;
  principalToken: PrincipalTokenInfo;
  baseToken: CurveLpTokenInfo;
  metaToken?: CurveLpTokenInfo;
}

export function getZapPurchaseTokenGraph(
  principalToken: PrincipalTokenInfo,
  token: TokenInfo
): ZapPurchaseTokenGraph | undefined {
  if (!underlyingIsCurveLpToken(principalToken)) return;

  const tokenIsValidInputToken = getCurvePoolTokensByPrincipalToken(
    principalToken
  )
    .map(({ address }) => address)
    .includes(token.address);

  if (!tokenIsValidInputToken) return;

  const baseToken = getTokenInfo<CurveLpTokenInfo>(
    principalToken.extensions.underlying
  );

  const baseCurvePoolTokens = getCurvePoolTokensByCurveLpToken(baseToken);

  const baseCurvePoolTokensContainsToken = baseCurvePoolTokens
    .map(({ address }) => address)
    .includes(token.address);

  if (baseCurvePoolTokensContainsToken)
    return { token, principalToken, baseToken };

  const metaToken = baseCurvePoolTokens
    .filter(isCurveLpToken)
    .find((baseCurvePoolToken) =>
      isTokenInCurvePoolOfCurveLpToken(baseCurvePoolToken, token)
    );

  return { token, principalToken, baseToken, metaToken };
}
