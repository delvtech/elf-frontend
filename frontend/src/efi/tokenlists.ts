import { TokenList } from "@uniswap/token-lists";
import keyBy from "lodash.keyby";

// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const chainName = getTokenListJsonId();
function getTokenListJsonId() {
  if (process.env.NODE_ENV === "test") {
    return "mock";
  }

  return process.env.REACT_APP_CHAIN_NAME || "testnet";
}

// Copied from testnet
export enum TokenListTag {
  UNDERLYING = "underlying",
  PRINCIPAL = "eP",
  YIELD = "eY",
}

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const tokenListJson: TokenList = require(`tokenlists/${chainName}.tokenlist.json`);

const TokenInfos = tokenListJson.tokens;
export const TokenMetadata = keyBy(TokenInfos, "address");

export const PrincipalTokenInfos = TokenInfos.filter((tokenInfo) =>
  tokenInfo.tags?.includes(TokenListTag.PRINCIPAL)
);
export const PrincipalTokenMetadata = keyBy(PrincipalTokenInfos, "address");

const YieldTokenInfos = TokenInfos.filter(
  (tokenInfo) => tokenInfo.tags?.includes(TokenListTag.YIELD),
  "address"
);
export const YieldTokenMetadata = keyBy(YieldTokenInfos);

export const UnderlyingTokenInfos = TokenInfos.filter((tokenInfo) =>
  tokenInfo.tags?.includes(TokenListTag.UNDERLYING)
);
export const UnderlyingTokenMetadata = keyBy(UnderlyingTokenInfos, "address");

export default tokenListJson;
