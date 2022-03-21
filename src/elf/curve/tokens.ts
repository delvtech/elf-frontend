import {
  CurvePool1,
  CurvePool2,
  CurvePool3,
  CurvePool1__factory,
  CurvePool2__factory,
  CurvePool3__factory,
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

export type CurvePool = CurvePool1 | CurvePool2 | CurvePool3;

export function getCurvePoolContractByCurveLpToken(
  tokenInfo: CurveLpTokenInfo
): CurvePool {
  const isCrv3Crypto = tokenInfo.symbol === "crv3crypto";
  const isCrvTriCrypto = tokenInfo.symbol === "crvTricrypto";

  // The tri crypto pools are an edge case for these calculations because the
  // pool indicated in the token extension is a wrapper contract which enables
  // us to use ETH over WETH. However, that contract does not have the
  // calc_token_amount function we need to get the correct price
  const CRVTRICRYPTO_POOL = "0x80466c64868E1ab14a1Ddf27A676C3fcBE638Fe5";
  if (isCrvTriCrypto)
    return CurvePool3__factory.connect(CRVTRICRYPTO_POOL, defaultProvider);
  const CRV3CRYPTO_POOL = "0xD51a44d3FaE010294C616388b506AcdA1bfAAE46";
  if (isCrv3Crypto)
    return CurvePool3__factory.connect(CRV3CRYPTO_POOL, defaultProvider);

  return tokenInfo.extensions.poolAssets.length === 2
    ? CurvePool1__factory.connect(tokenInfo.extensions.pool, defaultProvider)
    : CurvePool2__factory.connect(tokenInfo.extensions.pool, defaultProvider);
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
