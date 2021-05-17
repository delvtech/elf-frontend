import { TokenInfo } from "@uniswap/token-lists";
import {
  TokenListTag,
  YieldTokenInfo,
  YieldTokenPoolInfo,
} from "tokenlists/types";

import { tokenListJson } from "efi/tokenlists";

export enum WeightedPoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  EXACT_BPT_IN_FOR_TOKENS_OUT,
  BPT_IN_FOR_EXACT_TOKENS_OUT,
}

export const WeightedPoolTokenInfos: YieldTokenPoolInfo[] =
  tokenListJson.tokens.filter((tokenInfo): tokenInfo is YieldTokenPoolInfo =>
    isYieldTokenPool(tokenInfo)
  );

function isYieldTokenPool(tokenInfo: TokenInfo): tokenInfo is YieldTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.WPOOL);
}
