import { useCallback, useEffect, useMemo, useState } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import mapValues from "lodash.mapvalues";

import { hasSameKeys } from "efi/base/hasSameKeys";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoAddress } from "efi/crypto/getCryptoAddress";

interface ActiveTrancheInfo {
  activeTranche: Tranche | undefined;
  activeTrancheIndex: number | undefined;
  availableTranches: Tranche[];
  setActiveTranche: (newTranche: Tranche) => void;
}

export function useActiveTranche(
  tranchesByBaseAsset: Record<string, Tranche[]>,
  activeBaseAsset: CryptoAsset
): ActiveTrancheInfo {
  const {
    activeTrancheIndexes,
    setActiveTrancheIndexes,
  } = useActiveTrancheIndexes(tranchesByBaseAsset);

  const baseAssetAddress = getCryptoAddress(activeBaseAsset);
  const availableTranches = useMemo(
    () => tranchesByBaseAsset[baseAssetAddress] || [],
    [baseAssetAddress, tranchesByBaseAsset]
  );
  const setActiveTranche = useCallback(
    (tranche: Tranche) => {
      setActiveTrancheIndexes((prevActiveTranches) => {
        const trancheIndex = findTrancheIndex(availableTranches, tranche);
        return {
          ...prevActiveTranches,
          [baseAssetAddress]: trancheIndex,
        };
      });
    },
    [availableTranches, baseAssetAddress, setActiveTrancheIndexes]
  );

  const activeTrancheIndex = activeTrancheIndexes[baseAssetAddress];
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
