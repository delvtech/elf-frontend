import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";
import { PrincipalTokenInfo } from "tokenlists/types";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import {
  getTokenInfo,
  principalTokenInfos,
  yieldTokenInfos,
} from "efi/tokenlists";

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
export const openTranches = getSmartContractFromRegistryMulti(
  openTranchesInfos.map(({ address }) => address),
  Tranche__factory.connect
) as Tranche[];

/**
 * A lookup object for the tranche contracts of a given base asset, ie:
 *
 * {
 *   ethereum: [Tranche, Tranche, ....],
 *   0xUsdcAddress: [Tranche, ...],
 * }
 */
export const tranchesByBaseAsset: Record<string, Tranche[]> = groupBy(
  openTranches,
  (tranche) => {
    const {
      extensions: { underlying: baseAssetAddress },
    } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
    return CryptoAssets[baseAssetAddress].id;
  }
);
