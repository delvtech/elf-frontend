import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";
import uniqBy from "lodash.uniqby";
import { PrincipalTokenInfo } from "tokenlists/types";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import { getTokenInfo } from "efi/tokenlists";
import { OpenTranches } from "efi/tranche/tranches";

export const openTrancheBaseAssets = getBaseAssetsForTranches(
  OpenTranches
) as CryptoAsset[];

/**
 * A lookup object for the tranche contracts of a given base asset's `CryptoAsset.id`, ie:
 *
 * {
 *   'ethereum': [Tranche, Tranche, ....],
 *   '0xUsdcAddress': [Tranche, ...],
 * }
 */
export const tranchesByBaseAsset: Record<string, Tranche[]> = groupBy(
  OpenTranches,
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

function getBaseAssetsForTranches(
  tranches: (Tranche | undefined)[]
): (CryptoAsset | undefined)[] {
  const cryptoAssets = tranches.map((tranche) => {
    if (!tranche?.address) {
      return undefined;
    }
    const {
      extensions: { underlying },
    } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
    return CryptoAssets[underlying];
  });

  // De-dupe since multiple tranches can have the same base asset
  const uniqueCryptoAssets = uniqBy(
    cryptoAssets.filter((v) => !!v),
    (v) => v?.id
  );

  return uniqueCryptoAssets;
}
