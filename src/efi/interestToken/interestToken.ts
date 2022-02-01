import { InterestToken__factory } from "@elementfi/core-typechain";
import { TokenInfo, TokenTag, YieldTokenInfo } from "@elementfi/tokenlist";
import { defaultProvider } from "efi/providers/providers";
import { tokenListJson } from "efi/tokenlists/tokenlists";
import keyBy from "lodash.keyby";

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
  return !!tokenInfo?.tags?.includes(TokenTag.YIELD);
}
