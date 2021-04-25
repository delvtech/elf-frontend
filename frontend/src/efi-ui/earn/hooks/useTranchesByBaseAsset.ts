import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";
import mapValues from "lodash.mapvalues";
import zip from "lodash.zip";

export function useTranchesByBaseAsset(
  tranches: (Tranche | undefined)[],
  baseAssets: (CryptoAsset | undefined)[]
): Record<string, Tranche[]> {
  const zipped = zip(tranches, baseAssets);

  // remove any zipped entries that don't have groupable data yet
  const filtered = zipped.filter((entry): entry is [Tranche, CryptoAsset] =>
    entry.every((value) => !!value)
  );

  const entriesByBaseAsset = groupBy(
    filtered,
    ([tranche, cryptoAsset]) => cryptoAsset.id
  );

  // We only care about the tranches now, not the entire entry
  const tranchesByBaseAsset: Record<
    string,
    Tranche[]
  > = mapValues(entriesByBaseAsset, (group) =>
    group.map(([tranche, unusedBaseAsset]) => tranche)
  );

  return tranchesByBaseAsset;
}
