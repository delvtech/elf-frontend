import { useCallback, useMemo, useState } from "react";

import groupBy from "lodash.groupby";
import mapValues from "lodash.mapvalues";

import { TrancheInfo } from "efi-ui/tranche/TrancheInfo";

/**
 * Custom hook for managing the active yield position based on the currently
 * active base asset.
 */
export function useActiveTrancheInfo(
  trancheInfos: TrancheInfo[],
  activeBaseAssetSymbol: string
) {
  const trancheInfosByBaseAsset: Record<string, TrancheInfo[]> = useMemo(
    () => groupBy(trancheInfos, "baseAssetSymbol"),
    [trancheInfos]
  );

  const [activeTrancheInfosByBaseAsset, setTrancheInfosState] = useState(
    mapValues(
      trancheInfosByBaseAsset,
      ([firstTrancheInfo]) => firstTrancheInfo.id
    )
  );

  const setActiveTrancheInfo = useCallback(
    (trancheInfoId: string) => {
      setTrancheInfosState((prevState) => ({
        ...prevState,
        [activeBaseAssetSymbol]: trancheInfoId,
      }));
    },
    [activeBaseAssetSymbol]
  );

  const activeTrancheInfo = getActiveYieldPosition(
    activeTrancheInfosByBaseAsset,
    activeBaseAssetSymbol,
    trancheInfosByBaseAsset
  );

  return {
    activeTrancheInfo,
    setActiveTrancheInfo,
  };
}

function getActiveYieldPosition(
  activeYieldPositionIdByBaseAsset: Record<string, string>,
  activeBaseAssetSymbol: string,
  yieldPositionsByBaseAsset: Record<string, TrancheInfo[]>
) {
  const activeYieldPositionId =
    activeYieldPositionIdByBaseAsset[activeBaseAssetSymbol];

  const activeYieldPosition = yieldPositionsByBaseAsset[
    activeBaseAssetSymbol
  ].find(({ id }) => id === activeYieldPositionId) as TrancheInfo;

  return activeYieldPosition;
}
