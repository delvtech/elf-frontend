import { TokenInfo, TokenList } from "@uniswap/token-lists";
import keyBy from "lodash.keyby";

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

// Copied from testnet
export enum TokenListTag {
  CCPOOL = "ccpool",
  WPOOL = "wpool",
  UNDERLYING = "underlying",
  PRINCIPAL = "eP",
  YIELD = "eY",
}
export interface PrincipalTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the principal token
     */
    underlying: string;

    /**
     * The interest token for the principal token
     */
    interestToken: string;

    /**
     * Number of seconds after epoch when the principal token can be redeemed
     */
    unlockTimestamp: number;

    /**
     * The wrapped position, eg: an Element yearn vault asset proxy
     */
    position: string;
  };
}
export interface YieldTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the yield token
     */
    underlying: string;

    /**
     * The Principal Token's address
     */
    tranche: string;
  };
}
export interface PrincipalTokenPoolInfo extends TokenInfo {
  extensions: {
    /**
     * The principal token address
     */
    bond: string;

    /**
     * The underlying base asset for the principal token
     */
    underlying: string;

    /**
     * balancer poolId
     */
    poolId: string;

    /**
     * Number of seconds after epoch when the pool assets will converge in
     * price.
     */
    expiration: number;

    /**
     * The number of seconds in the pools timescale.
     */
    unitSeconds: number;
  };
}
export interface YieldTokenPoolInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the yield token
     */
    poolId: string;
  };
}

type AnyTokenListInfo =
  | TokenInfo
  | PrincipalTokenInfo
  | YieldTokenInfo
  | PrincipalTokenPoolInfo
  | YieldTokenPoolInfo;

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
/**
 * A lookup object for getting the name, symbol, and decimals of any principal
 * token, yield token, or base asset address.
 */
export const TokenMetadata: Record<string, AnyTokenListInfo> = keyBy(
  tokenInfos,
  "address"
);

/**
 * The list of all base assets, it includes weth instead of eth
 */
export const UnderlyingTokenInfos = tokenInfos.filter((tokenInfo) =>
  tokenInfo.tags?.includes(TokenListTag.UNDERLYING)
);

/**
 * The list of all principal tokens
 */
export const PrincipalTokenInfos: PrincipalTokenInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is PrincipalTokenInfo => isPrincipalToken(tokenInfo)
);

/**
 * The list of all yield tokens
 */
export const YieldTokenInfos: YieldTokenInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is YieldTokenInfo => isYieldToken(tokenInfo)
);

/**
 * The list of all principal token pools
 */
export const PrincipalTokenPoolInfos: PrincipalTokenPoolInfo[] =
  tokenInfos.filter((tokenInfo): tokenInfo is PrincipalTokenPoolInfo =>
    isPrincipalTokenPool(tokenInfo)
  );

/**
 * The list of all yield tokens
 */
export const YieldTokenPoolInfos: YieldTokenPoolInfo[] = tokenInfos.filter(
  (tokenInfo): tokenInfo is YieldTokenPoolInfo => isYieldTokenPool(tokenInfo)
);

export default tokenListJson;

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
