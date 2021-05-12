import { TokenInfo, TokenList } from "@uniswap/token-lists";
import groupBy from "lodash.groupby";
import keyBy from "lodash.keyby";
import {
  AnyTokenListInfo,
  PrincipalTokenInfo,
  PrincipalTokenPoolInfo,
  TokenListTag,
  YieldTokenInfo,
  YieldTokenPoolInfo,
} from "tokenlists/types";

// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const chainName = getTokenListJsonId();

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const tokenListJson: TokenList = require(`tokenlists/${chainName}.tokenlist.json`);

const tokenInfos = tokenListJson.tokens;

/**
 * Helper function for looking up a tokenlist info when you know the type of TokenInfo you want.
 * This is useful when you want strongly-typed properties for `extensions`, eg:
 *
 * const principalToken = getTokenInfo<PrincipalTokenInfo>('0xdeadbeef')
 * const { extensions: { underlying, ... } } = principalToken;
 */
export function getTokenInfo<T extends TokenInfo>(address: string): T {
  return TokenMetadata[address] as T;
}
export const TokenMetadata: Record<string, AnyTokenListInfo> = keyBy(
  tokenInfos,
  "address"
);

/**
 * The list of all principal tokens
 */
export const principalTokenInfos: PrincipalTokenInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is PrincipalTokenInfo => isPrincipalToken(tokenInfo)
);
export const PrincipalTokenInfosByBaseAsset = groupBy(
  principalTokenInfos,
  (tokenInfo) => tokenInfo.extensions.underlying
);

/**
 * The list of all yield tokens
 */
export const yieldTokenInfos: YieldTokenInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is YieldTokenInfo => isYieldToken(tokenInfo)
);

/**
 * The list of all principal token pools
 */
export const principalTokenPoolInfos: PrincipalTokenPoolInfo[] =
  tokenInfos.filter((tokenInfo): tokenInfo is PrincipalTokenPoolInfo =>
    isPrincipalTokenPool(tokenInfo)
  );

/**
 * The list of all yield tokens
 */
export const yieldTokenPoolInfos: YieldTokenPoolInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is YieldTokenPoolInfo => isYieldTokenPool(tokenInfo)
);

function getTokenListJsonId() {
  if (process.env.NODE_ENV === "test") {
    return "mock";
  }

  return process.env.REACT_APP_CHAIN_NAME || "testnet";
}

function isPrincipalToken(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.PRINCIPAL);
}

function isYieldToken(tokenInfo: TokenInfo): tokenInfo is YieldTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.YIELD);
}

function isPrincipalTokenPool(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.CCPOOL);
}

function isYieldTokenPool(tokenInfo: TokenInfo): tokenInfo is YieldTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.WPOOL);
}
