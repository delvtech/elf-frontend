import { TokenInfo } from "@uniswap/token-lists";
import { InterestToken__factory } from "elf-contracts-typechain/dist/types/factories/InterestToken__factory";
import { TokenListTag, YieldTokenInfo } from "tokenlists/types";

import { tokenListJson } from "efi/tokenlists/tokenlists";
import keyBy from "lodash.keyby";
import { defaultProvider } from "efi/providers/providers";

/**
 * The list of all yield tokens
 */
export const yieldTokenInfos: YieldTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is YieldTokenInfo => isYieldToken(tokenInfo)
);
export const interestTokenContracts = yieldTokenInfos.map(({ address }) =>
  InterestToken__factory.connect(address, defaultProvider)
);
export const interestTokenContractsByAddress = keyBy(
  interestTokenContracts,
  (interestToken) => interestToken.address
);

export function isYieldToken(
  tokenInfo: TokenInfo
): tokenInfo is YieldTokenInfo {
  return !!tokenInfo?.tags?.includes(TokenListTag.YIELD);
}
