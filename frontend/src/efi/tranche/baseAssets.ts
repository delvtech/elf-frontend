import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";
import { PrincipalTokenInfo } from "tokenlists/types";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import { getTokenInfo } from "efi/tokenlists";
import { trancheContracts } from "efi/tranche/tranches";

/**
 * A lookup object for the tranche contracts of a given base asset's `CryptoAsset.id`, ie:
 *
 * {
 *   'ethereum': [Tranche, Tranche, ....],
 *   '0xUsdcAddress': [Tranche, ...],
 * }
 */
export const tranchesByBaseAsset: Record<string, Tranche[]> = groupBy(
  trancheContracts,
  (tranche) => {
    const {
      extensions: { underlying: baseAssetAddress },
    } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
    return CryptoAssets[baseAssetAddress].id;
  }
);

export function getBaseAssetForTranche(trancheAddress: string): CryptoAsset {
  const {
    extensions: { underlying },
  } = getTokenInfo<PrincipalTokenInfo>(trancheAddress);
  return CryptoAssets[underlying];
}
