import { TokenInfo } from "@uniswap/token-lists";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { TokenListTag, YieldTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";

/**
 * The list of all yield tokens
 */
export const YieldTokenInfos: YieldTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is YieldTokenInfo => isYieldToken(tokenInfo)
);
export const InterestTokenContracts = getSmartContractFromRegistryMulti(
  YieldTokenInfos.map(({ address }) => address),
  InterestToken__factory.connect
) as InterestToken[];

function isYieldToken(tokenInfo: TokenInfo): tokenInfo is YieldTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.YIELD);
}
