import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";

import { getSmartContractFromRegistryMulti } from "efi-ui/contracts/SmartContractsRegistry";
import { PrincipalTokenInfos } from "efi/tokenlists";
import { Tranche } from "elf-contracts/types/Tranche";

export const TrancheContracts = getSmartContractFromRegistryMulti(
  PrincipalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];
