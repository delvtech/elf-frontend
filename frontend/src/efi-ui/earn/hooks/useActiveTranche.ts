import { useCallback, useEffect, useState } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import mapValues from "lodash.mapvalues";

import { hasSameKeys } from "efi/base/hasSameKeys";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { tranchesByBaseAsset } from "efi/tranche/baseAssets";

interface ActiveTrancheInfo {
  activeTranche: Tranche;
  activeTrancheIndex: number;
  availableTranches: Tranche[];
  setActiveTranche: (newTranche: Tranche) => void;
}

export function useActiveTranche(
  activeBaseAsset: CryptoAsset
): ActiveTrancheInfo {
  const { activeTrancheIndexes, setActiveTrancheIndexes } =
    useActiveTrancheIndexes(tranchesByBaseAsset);

  const availableTranches = tranchesByBaseAsset[activeBaseAsset.id];

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

  const activeTrancheIndex = activeTrancheIndexes[activeBaseAsset.id];
  const activeTranche = availableTranches[activeTrancheIndex];

  return {
    activeTranche,
    activeTrancheIndex,
    availableTranches,
    setActiveTranche,
  };
}

function useActiveTrancheIndexes(
  tranchesByBaseAsset: Record<string, Tranche[]>
) {
  const defaultActiveTranches: Record<string, number> = mapValues(
    tranchesByBaseAsset,
    () => 0
  );

  const [activeTrancheIndexes, setActiveTrancheIndexes] = useState(
    defaultActiveTranches
  );

  // tranchesByBaseAsset starts off empty, so keep our active indexes in sync as
  // it populates.
  useEffect(() => {
    if (!hasSameKeys(activeTrancheIndexes, tranchesByBaseAsset)) {
      setActiveTrancheIndexes(defaultActiveTranches);
    }
  }, [activeTrancheIndexes, defaultActiveTranches, tranchesByBaseAsset]);

  return {
    activeTrancheIndexes,
    setActiveTrancheIndexes,
  };
}

function findTrancheIndex(tranches: Tranche[], tranche: Tranche): number {
  return tranches.findIndex((t) => t.address === tranche.address);
}
