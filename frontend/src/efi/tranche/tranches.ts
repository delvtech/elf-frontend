import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { principalTokenInfos, yieldTokenInfos } from "efi/tokenlists";

export const TrancheContracts = getSmartContractFromRegistryMulti(
  principalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export const InterestTokenContracts = getSmartContractFromRegistryMulti(
  yieldTokenInfos.map(({ address }) => address),
  InterestToken__factory.connect
) as InterestToken[];

const openTranchesInfos = principalTokenInfos.filter(
  ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > Date.now()
);

/**
 * The list of tranches that are currently running.
 */
export const OpenTranches = getSmartContractFromRegistryMulti(
  openTranchesInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];
