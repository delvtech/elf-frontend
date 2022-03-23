import {
  CurveLpTokenInfo,
  PrincipalTokenInfo,
  TokenInfo,
} from "@elementfi/tokenlist";
import {
  getCurvePoolTokensByCurveLpToken,
  isCurveLpToken,
} from "elf/curve/tokens";
import { getTokenInfo } from "tokenlists/tokenlists";

enum ZapPurchasePathKind {
  SingleStep = "SingleStep",
  DoubleStep = "DoubleStep",
}

interface ZapPurchasePathSingleStep {
  kind: ZapPurchasePathKind.SingleStep;
  principalToken: PrincipalTokenInfo;
  baseToken: CurveLpTokenInfo;
  curvePoolToken: TokenInfo;
}

interface ZapPurchasePathDoubleStep {
  kind: ZapPurchasePathKind.DoubleStep;
  principalToken: PrincipalTokenInfo;
  baseToken: CurveLpTokenInfo;
  metaToken: CurveLpTokenInfo;
  curvePoolToken: TokenInfo;
}
/**
 * ZapPurchasePath is used to signify the relationship between the
 * curvePoolToken and the principalToken. This is required as we must know which
 * internal curvePoolLpTokens that are exchanged for in order to calculate
 * approximate pricing of the principalToken in terms of the curvePoolToken and
 * also to construct the zap contract inputs
 *
 * The properties under each indicate two paths
 *
 * 1) curvePoolToken <-> baseToken <-> principalToken
 * This is the single step approach as their is only 1 token between the
 * curvePoolToken and the principalToken. An example of this is the steCRV
 * principal token where ETH (being the curvePoolToken) must be exchanged into
 * steCRV (the baseToken) before being exchanged into it's namesake principal
 * token
 *
 * 2) curvePoolToken <-> metaToken <-> baseToken <-> principalToken
 * This is the double step approach as their is 2 tokens between the
 * curvePoolToken and principalToken. An example would be MIM-3LP principal
 * token where DAI (being the curvePoolToken) must be exchanged into 3CRV
 * (the metaToken) which must be exchanged into MIM-3LP (the baseToken) which
 * finally is exchanged for the MIM-3LP principalToken
 */
type ZapPurchasePath = ZapPurchasePathSingleStep | ZapPurchasePathDoubleStep;

/**
 * This function assumes that the curvePool token is a valid member of the
 * curve pools related to the principalToken's underlying token address.
 *
 * e.g curvePoolToken is a member of the returned values from
 * getCurvePoolTokensByPrincipalToken(principalToken). We assume this so as not
 * to have an undefined case for simplicity
 *
 * @param principalToken - the principaToken
 * @param curvePoolToken - a token which is a member of a curve pool related to
 *                         the underlying pool of the principal token
 * @returns zapPurchasePath - an object containing the inner lptokens which form
 *                            the exchange path between the principal and
 *                            curvePool tokens
 * */
export function getZapPurchasePath(
  principalToken: PrincipalTokenInfo,
  curvePoolToken: TokenInfo
): ZapPurchasePath {
  const baseToken = getTokenInfo<CurveLpTokenInfo>(
    principalToken.extensions.underlying
  );

  const baseCurvePoolTokens = getCurvePoolTokensByCurveLpToken(baseToken);

  const baseCurvePoolTokensContainsToken = baseCurvePoolTokens
    .map(({ address }) => address)
    .includes(curvePoolToken.address);

  if (baseCurvePoolTokensContainsToken)
    return {
      kind: ZapPurchasePathKind.SingleStep,
      curvePoolToken,
      principalToken,
      baseToken,
    };

  const metaToken = baseCurvePoolTokens
    .filter(isCurveLpToken)
    .find((metaCurvePoolToken) =>
      getCurvePoolTokensByCurveLpToken(metaCurvePoolToken)
        .map(({ address }) => address)
        .includes(curvePoolToken.address)
    ) as CurveLpTokenInfo;

  return {
    kind: ZapPurchasePathKind.DoubleStep,
    curvePoolToken,
    principalToken,
    baseToken,
    metaToken,
  };
}
