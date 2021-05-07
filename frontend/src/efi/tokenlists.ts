import { TokenList } from "@uniswap/token-lists";
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

const tokenInfos = tokenListJson.tokens;

/**
 * A lookup object for getting the name, symbol, and decimals of any principal
 * token, yield token, or base asset address.
 */
export const TokenMetadata = keyBy(tokenInfos, "address");

/**
 * The list of all base assets
 */
export const UnderlyingTokenInfos = tokenInfos.filter((tokenInfo) =>
  tokenInfo.tags?.includes(TokenListTag.UNDERLYING)
);

/**
 * The list of all principal tokens
 */
export const PrincipalTokenInfos = tokenInfos.filter((tokenInfo) =>
  tokenInfo.tags?.includes(TokenListTag.PRINCIPAL)
);

/**
 * The list of all yield tokens
 */
export const YieldTokenInfos = tokenInfos.filter(
  (tokenInfo) => tokenInfo.tags?.includes(TokenListTag.YIELD),
  "address"
);

export default tokenListJson;

function getTokenListJsonId() {
  if (process.env.NODE_ENV === "test") {
    return "mock";
  }

  return process.env.REACT_APP_CHAIN_NAME || "testnet";
}
