import { TokenInfo } from "@uniswap/token-lists";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { PrincipalTokenInfo, TokenListTag } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { tokenListJson } from "efi/tokenlists";
import keyBy from "lodash.keyby";

export const PrincipalTokenInfos: PrincipalTokenInfo[] =
  tokenListJson.tokens.filter((tokenInfo): tokenInfo is PrincipalTokenInfo =>
    isPrincipalToken(tokenInfo)
  );

export const trancheContracts = getSmartContractFromRegistryMulti(
  PrincipalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];
export const TrancheContractsByAddress = keyBy(
  trancheContracts,
  (tranche) => tranche.address
);

const openTranchesInfos = PrincipalTokenInfos.filter(
  ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > Date.now()
);

/**
 * The list of tranches that are currently running.
 */
export const OpenTranches = getSmartContractFromRegistryMulti(
  openTranchesInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

function isPrincipalToken(
  tokenInfo: TokenInfo
): tokenInfo is PrincipalTokenInfo {
  return !!tokenInfo.tags?.includes(TokenListTag.PRINCIPAL);
}
