import { TokenInfo } from "@uniswap/token-lists";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { TokenListTag, YieldTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";
import keyBy from "lodash.keyby";

/**
 * The list of all yield tokens
 */
export const yieldTokenInfos: YieldTokenInfo[] = tokenListJson.tokens.filter(
  (tokenInfo): tokenInfo is YieldTokenInfo => isYieldToken(tokenInfo)
);
export const interestTokenContracts = getSmartContractFromRegistryMulti(
  yieldTokenInfos.map(({ address }) => address),
  InterestToken__factory.connect
) as InterestToken[];
export const InterestTokenContractsByAddress = keyBy(
  interestTokenContracts,
  (interestToken) => interestToken.address
);
function isYieldToken(tokenInfo: TokenInfo): tokenInfo is YieldTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.YIELD);
}
