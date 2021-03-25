import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import groupBy from "lodash.groupby";
import mapValues from "lodash.mapvalues";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";

export function useTranchesByBaseAsset(
  provider?: Provider
): Record<string, Tranche[]> {
  const trancheContracts = useTrancheContracts(provider);
  const baseAssetAddressResults = useSmartContractReadCalls(
    trancheContracts,
    "underlying"
  );

  const zipped = zip(trancheContracts, getQueriesData(baseAssetAddressResults));

  // remove any zipped entries that don't have groupable data yet
  const filtered = zipped.filter((entry): entry is [Tranche, string] =>
    entry.every((value) => !!value)
  );

  const entriesByBaseAsset = groupBy(
    filtered,
    ([tranche, baseAssetAddresses]) => baseAssetAddresses
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
