import { CSSProperties, ReactElement, useMemo } from "react";

import tw from "efi-tailwindcss-classnames";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { openPrincipalPools, principalPools } from "efi/pools/ccpool";
import { PrincipalPoolTableHeader } from "./PrincipalPoolTableHeader";

interface PrincipalPoolTableProps {
  showMaturePools?: boolean;
}

const principalPoolTableStyle: CSSProperties = {
  width: 1240,
};

export function PrincipalPoolTable({
  showMaturePools = true,
}: PrincipalPoolTableProps): ReactElement {
  const principalPoolsToShow = showMaturePools
    ? principalPools
    : openPrincipalPools;

  const sortedPools = useMemo(
    () =>
      [...principalPoolsToShow]
        .sort((info) => info.extensions.createdAtTimestamp)
        .reverse(),
    [principalPoolsToShow]
  );

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "space-y-5")}
      style={principalPoolTableStyle}
    >
      <PrincipalPoolTableHeader className={tw("hidden", "lg:grid")} />

      {sortedPools.map((poolInfo) => {
        return (
          <PrincipalPoolCard
            key={poolInfo.address}
            principalPoolInfo={poolInfo}
          />
        );
      })}
    </div>
  );
}
