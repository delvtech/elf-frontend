import { TokenInfo, TokenList } from "@uniswap/token-lists";
import keyBy from "lodash.keyby";
import { AnyTokenListInfo } from "tokenlists/types";
import TokenListJsonFileTestnet from "tokenlists/testnet.tokenlist.json";

// export const tokenListJson: TokenList = require(tokenListJsonFilePath);
// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const chainName = getTokenListJsonId();

const tokenListJsonFilePath = `elf-tokenlist/dist/${chainName}.tokenlist.json`;

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
// export const tokenListJson: TokenList = require(tokenListJsonFilePath);
export const tokenListJson: TokenList =
  chainName === "mock" || chainName === "testnet"
    ? TokenListJsonFileTestnet
    : require(tokenListJsonFilePath);

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

function getTokenListJsonId() {
  if (process.env.NODE_ENV === "test") {
    return "mock";
  }

  return process.env.REACT_APP_CHAIN_NAME || "testnet";
}
