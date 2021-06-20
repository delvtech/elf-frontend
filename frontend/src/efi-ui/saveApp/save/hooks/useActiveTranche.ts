import { useCallback, useState } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import mapValues from "lodash.mapvalues";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { tranchesByBaseAsset } from "efi/tranche/baseAssets";

interface ActiveTrancheInfo {
  activeTranche: Tranche;
  activeTrancheIndex: number;
  availableTranches: Tranche[];
  setActiveTranche: (newTranche: Tranche) => void;
}

// By default, use the first open tranche.
const defaultActiveTranches: Record<string, number> = mapValues(
  tranchesByBaseAsset,
  () => 0
);

export function useActiveTranche(
  activeBaseAsset: CryptoAsset
): ActiveTrancheInfo {
  const [activeTrancheIndexes, setActiveTrancheIndexes] = useState(
    defaultActiveTranches
  );

  const availableTranches = tranchesByBaseAsset[activeBaseAsset.id];
  const activeTrancheIndex = activeTrancheIndexes[activeBaseAsset.id];
  const activeTranche = availableTranches[activeTrancheIndex];

  const setActiveTranche = useCallback(
    (tranche: Tranche) => {
      setActiveTrancheIndexes((prevActiveTranches) => {
        const trancheIndex = findTrancheIndex(availableTranches, tranche);
        return {
          ...prevActiveTranches,
          [activeBaseAsset.id]: trancheIndex,
        };
      });
    },
    [activeBaseAsset?.id, availableTranches, setActiveTrancheIndexes]
  );

  return {
    activeTranche,
    activeTrancheIndex,
    availableTranches,
    setActiveTranche,
  };
}

function findTrancheIndex(tranches: Tranche[], tranche: Tranche): number {
  return tranches.findIndex((t) => t.address === tranche.address);
}
