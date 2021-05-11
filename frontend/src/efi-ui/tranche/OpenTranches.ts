import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { principalTokenInfos, TokenMetadata } from "efi/tokenlists";
import { PrincipalTokenInfo } from "tokenlists/types";

const openTranchesInfos = principalTokenInfos.filter(
  ({ extensions: { unlockTimestamp } }) => unlockTimestamp * 1000 > Date.now()
);

const openTranches = getSmartContractFromRegistryMulti(
  openTranchesInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

export const OpenTranchesByBaseAsset = groupBy(
  openTranches,
  (tranche) =>
    (TokenMetadata[tranche.address] as PrincipalTokenInfo).extensions.underlying
);
