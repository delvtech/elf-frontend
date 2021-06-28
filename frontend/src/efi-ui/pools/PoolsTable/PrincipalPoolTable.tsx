import { Fragment, ReactElement } from "react";

import tw from "efi-tailwindcss-classnames";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { openPrincipalPools, principalPools } from "efi/pools/ccpool";

interface PrincipalPoolTableProps {
  showMaturePools?: boolean;
}

export function PrincipalPoolTable({
  showMaturePools = true,
}: PrincipalPoolTableProps): ReactElement {
  const principalPoolsToShow = showMaturePools
    ? principalPools
    : openPrincipalPools;

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "w-full", "space-y-5")}
    >
      <Fragment>
        {principalPoolsToShow.map((poolInfo) => {
          return (
            <PrincipalPoolCard
              key={poolInfo.address}
              principalPoolInfo={poolInfo}
            />
          );
        })}
      </Fragment>
    </div>
  );
}
