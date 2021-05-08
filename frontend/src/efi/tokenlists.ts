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
     * Number of seconds after epoch when the principal token can be redeemed
     */
    unlockTimestamp: number;
  };
}
export interface YieldTokenInfo extends TokenInfo {
  extensions: {
    /**
     * The underlying base asset for the yield token
     */
    underlying: string;
  };
}

const tokenInfos = tokenListJson.tokens;

/**
 * A lookup object for getting the name, symbol, and decimals of any principal
 * token, yield token, or base asset address.
 */
export const TokenMetadata = keyBy(tokenInfos, "address");

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
