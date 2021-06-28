import { Fragment, ReactElement } from "react";

import tw from "efi-tailwindcss-classnames";
import { YieldPoolCard } from "efi-ui/pools/PoolsTable/YieldPoolCard";
import { openYieldPools, yieldPools } from "efi/pools/weightedPool";

interface YieldPoolTableProps {
  showMaturePools?: boolean;
}

export function YieldPoolTable({
  showMaturePools = true,
}: YieldPoolTableProps): ReactElement {
  const yieldPoolsToShow = showMaturePools ? yieldPools : openYieldPools;

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "w-full", "space-y-5")}
    >
      <Fragment>
        {yieldPoolsToShow.map((poolInfo) => {
          return (
            <YieldPoolCard key={poolInfo.address} yieldPoolInfo={poolInfo} />
          );
        })}
      </Fragment>
    </div>
  );
}
