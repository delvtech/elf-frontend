import { TokenInfo } from "@uniswap/token-lists";
import { tokenListJson } from "efi/tokenlists";
import {
  PrincipalTokenPoolInfo,
  PrincipalTokenInfo,
  TokenListTag,
} from "tokenlists/types";

/**
 * The list of all principal token pools
 */
export const CCPoolTokenInfos: PrincipalTokenPoolInfo[] =
  tokenListJson.tokens.filter(
    (tokenInfo): tokenInfo is PrincipalTokenPoolInfo =>
      isPrincipalTokenPool(tokenInfo)
  );

function isPrincipalTokenPool(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.CCPOOL);
}
