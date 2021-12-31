import { TokenInfo, TokenList } from "@uniswap/token-lists";
import {
  mainnetTokenList as TokenListJsonFileMainnet,
  goerliTokenList as TokenListJsonFileGoerli,
} from "@elementfi/tokenlist";
import keyBy from "lodash.keyby";
import TokenListJsonFileTestnet from "tokenlists/testnet.tokenlist.json";
import { AnyTokenListInfo } from "tokenlists/types";

// export const tokenListJson: TokenList = require(tokenListJsonFilePath);
// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const tokenlistJsonId = getTokenListJsonId();

export const tokenListJson: TokenList = getTokenListJson();

const tokenInfos = tokenListJson.tokens;

function getTokenListJson(): TokenList {
  if (tokenlistJsonId === "testnet") {
    return TokenListJsonFileTestnet as TokenList;
  }

  if (tokenlistJsonId === "mainnet") {
    return TokenListJsonFileMainnet as TokenList;
  }

  if (tokenlistJsonId === "goerli") {
    return TokenListJsonFileGoerli as TokenList;
  }

  return TokenListJsonFileTestnet as TokenList;
}

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

  if (process.env.NEXT_PUBLIC_CHAIN_NAME === "mainnet_fork") {
    return "mainnet";
  }

  return process.env.NEXT_PUBLIC_CHAIN_NAME || "testnet";
}
