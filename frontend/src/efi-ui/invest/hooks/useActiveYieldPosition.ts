import { useCallback, useMemo, useState } from "react";
import groupBy from "lodash.groupby";
import mapValues from "lodash.mapvalues";
import { YieldPosition } from "efi-ui/invest/InvestView/YieldPositionPicker";

/**
 * Custom hook for managing the active yield position based on the currently
 * active base asset.
 */
export function useActiveYieldPosition(
  yieldPositions: YieldPosition[],
  activeBaseAssetSymbol: string
) {
  const yieldPositionsByBaseAsset: Record<
    string,
    YieldPosition[]
  > = useMemo(() => groupBy(yieldPositions, "baseAssetSymbol"), [
    yieldPositions,
  ]);

  const [activeYieldPositionByBaseAsset, setYieldPositionsState] = useState(
    mapValues(
      yieldPositionsByBaseAsset,
      ([firstYieldPosition]) => firstYieldPosition.id
    )
  );

  const setActiveYieldPosition = useCallback(
    (yieldPositionId: string) => {
      setYieldPositionsState((prevState) => ({
        ...prevState,
        [activeBaseAssetSymbol]: yieldPositionId,
      }));
    },
    [activeBaseAssetSymbol]
  );

  const activeYieldPosition = getActiveYieldPosition(
    activeYieldPositionByBaseAsset,
    activeBaseAssetSymbol,
    yieldPositionsByBaseAsset
  );

  return { activeYieldPosition, setActiveYieldPosition };
}

function getActiveYieldPosition(
  activeYieldPositionIdByBaseAsset: Record<string, string>,
  activeBaseAssetSymbol: string,
  yieldPositionsByBaseAsset: Record<string, YieldPosition[]>
) {
  const activeYieldPositionId =
    activeYieldPositionIdByBaseAsset[activeBaseAssetSymbol];

  const activeYieldPosition = yieldPositionsByBaseAsset[
    activeBaseAssetSymbol
  ].find(({ id }) => id === activeYieldPositionId) as YieldPosition;

  return activeYieldPosition;
}
