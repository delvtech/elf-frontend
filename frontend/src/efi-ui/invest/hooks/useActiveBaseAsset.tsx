import { useState } from "react";
import { BaseAsset } from "efi-ui/invest/types/BaseAsset";

export function useActiveBaseAsset(baseAssets: BaseAsset[]) {
  const [activeBaseAsset, setActiveBaseAsset] = useState(baseAssets[0]);

  return {
    activeBaseAsset,
    setActiveBaseAsset,
  };
}
