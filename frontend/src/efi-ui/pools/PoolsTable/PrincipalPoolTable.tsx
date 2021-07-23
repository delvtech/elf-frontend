import { CSSProperties, ReactElement, useMemo } from "react";

import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { useOpenPrincipalPools } from "efi-ui/pools/hooks/useOpenPrincipalPools";
import { PrincipalPoolTableRow } from "efi-ui/pools/PoolsTable/PrincipalPoolTableRow";
import { principalPools } from "efi/pools/ccpool";

import { PrincipalPoolTableHeader } from "./PrincipalPoolTableHeader";

interface PrincipalPoolTableProps {
  showMaturePools?: boolean;
  className: string;
}

const principalPoolTableStyle: CSSProperties = {
  width: 1240,
};

export function PrincipalPoolTable({
  showMaturePools = true,
  className,
}: PrincipalPoolTableProps): ReactElement {
  const openPrincipalPools = useOpenPrincipalPools();
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
      className={classNames(
        tw("flex-col", "items-center", "space-y-5"),
        className
      )}
      style={principalPoolTableStyle}
    >
      <PrincipalPoolTableHeader />

      {sortedPools.map((poolInfo) => {
        return (
          <PrincipalPoolTableRow
            key={poolInfo.address}
            principalPoolTokenInfo={poolInfo}
          />
        );
      })}
    </div>
  );
}
