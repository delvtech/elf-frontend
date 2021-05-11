import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { principalTokenInfos, yieldTokenInfos } from "efi/tokenlists";
import { Tranche } from "elf-contracts/types/Tranche";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { mapValues } from "lodash";

export const TrancheContracts = getSmartContractFromRegistryMulti(
  principalTokenInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export const TrancheContractsByBaseAsset = mapValues(
  PrincipalTokenInfosByBaseAsset,
  (principalTokenInfos) => {
    return principalTokenInfos.map(
      ({ address }) =>
        getSmartContractFromRegistry(
          address,
          Tranche__factory.connect
        ) as Tranche
    );
  }
);

export const InterestTokenContracts = getSmartContractFromRegistryMulti(
  yieldTokenInfos.map(({ address }) => address),
  InterestToken__factory.connect
) as InterestToken[];
