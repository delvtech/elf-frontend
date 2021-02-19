import { Provider } from "@ethersproject/providers";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import zip from "lodash.zip";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import groupBy from "lodash.groupby";
import mapValues from "lodash.mapvalues";
import { getQueriesData } from "efi-ui/base/queryResults";

export function useTranchesByBaseAsset(
  provider?: Provider
): Record<string, Tranche[]> {
  const trancheContracts = useTrancheContracts(provider);
  const elfAddressResults = useSmartContractReadCalls(trancheContracts, "elf");
  const elfContracts = useSmartContractsFromFactory(
    getQueriesData(elfAddressResults),
    Elf__factory.connect,
    provider
  );
  const baseAssetAddressResults = useSmartContractReadCalls(
    elfContracts,
    "token"
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
