import { ReactElement, useMemo } from "react";

import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { PrincipalPoolCardListItem } from "efi-ui/pools/PoolsTable/PrincipalPoolCardListItem";
import { principalPools } from "efi/pools/ccpool";
import { useOpenPrincipalPools } from "efi-ui/pools/hooks/useOpenPrincipalPools";

interface PrincipalPoolCardListProps {
  showMaturePools?: boolean;
  className: string;
}

export function PrincipalPoolCardList({
  showMaturePools = true,
  className,
}: PrincipalPoolCardListProps): ReactElement {
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
        tw("flex-col", "items-center", "space-y-5", "w-full"),
        className
      )}
    >
      {sortedPools.map((poolInfo) => {
        return (
          <PrincipalPoolCardListItem
            key={poolInfo.address}
            principalPoolTokenInfo={poolInfo}
          />
        );
      })}
    </div>
  );
}
