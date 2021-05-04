import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";

import { getSmartContractFromRegistryMulti } from "efi-ui/contracts/SmartContractsRegistry";
import { PrincipalTokenInfos, YieldTokenInfos } from "efi/tokenlists";
import { Tranche } from "elf-contracts/types/Tranche";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";

export const TrancheContracts = getSmartContractFromRegistryMulti(
  PrincipalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export const InterestTokenContracts = getSmartContractFromRegistryMulti(
  YieldTokenInfos.map(({ address }) => address),
  InterestToken__factory.connect
) as InterestToken[];
