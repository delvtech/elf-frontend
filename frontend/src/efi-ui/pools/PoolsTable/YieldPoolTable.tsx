import { CSSProperties, ReactElement, useMemo } from "react";

import tw from "efi-tailwindcss-classnames";
import { YieldPoolCard } from "efi-ui/pools/PoolsTable/YieldPoolCard";
import { openYieldPools, yieldPools } from "efi/pools/weightedPool";
import { YieldPoolTableHeader } from "./YieldPoolTableHeader";

interface YieldPoolTableProps {
  showMaturePools?: boolean;
}

const yieldPoolTableStyle: CSSProperties = {
  maxWidth: 1240,
  minWidth: 1000,
};

export function YieldPoolTable({
  showMaturePools = true,
}: YieldPoolTableProps): ReactElement {
  const yieldPoolsToShow = showMaturePools ? yieldPools : openYieldPools;

  const sortedPools = useMemo(
    () =>
      [...yieldPoolsToShow]
        .sort((info) => info.extensions.createdAtTimestamp)
        .reverse(),
    [yieldPoolsToShow]
  );

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "space-y-5")}
      style={yieldPoolTableStyle}
    >
      <YieldPoolTableHeader className={tw("hidden", "lg:grid")} />

      {sortedPools.map((poolInfo) => {
        return (
          <YieldPoolCard key={poolInfo.address} yieldPoolInfo={poolInfo} />
        );
      })}
    </div>
  );
}
