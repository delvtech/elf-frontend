import { CSSProperties, ReactElement } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { openPrincipalPools, principalPools } from "efi/pools/ccpool";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";

interface PrincipalPoolTableProps {
  showMaturePools?: boolean;
}

const principalPoolTableStyle: CSSProperties = {
  minWidth: 800,
};
export function PrincipalPoolTable({
  showMaturePools = true,
}: PrincipalPoolTableProps): ReactElement {
  const principalPoolsToShow = showMaturePools
    ? principalPools
    : openPrincipalPools;

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "items-center",
        "max-w-6xl",
        "min-w-1/2",
        "space-y-5"
      )}
      style={principalPoolTableStyle}
    >
      <div
        className={classNames(
          tw("grid", "gap-x-6", "grid-cols-8", "w-full"),
          Classes.TEXT_MUTED
        )}
      >
        <div className={tw("col-span-2", "pl-4")}>{t`Pool`}</div>
        <div className={tw("pl-2")}>{t`Pool Liquidity`}</div>
        <div>{t`Fixed APY`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Price`}</div>
        <div>{t`Term`}</div>
        {/* Actions */}
        <div />
      </div>
      {principalPoolsToShow.map((poolInfo) => {
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
