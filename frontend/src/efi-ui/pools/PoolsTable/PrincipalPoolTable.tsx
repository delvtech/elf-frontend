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
  maxWidth: 1240,
  minWidth: 1000,
};
export function PrincipalPoolTable({
  showMaturePools = true,
}: PrincipalPoolTableProps): ReactElement {
  const principalPoolsToShow = showMaturePools
    ? principalPools
    : openPrincipalPools;

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "space-y-5")}
      style={principalPoolTableStyle}
    >
      <div
        className={classNames(
          tw("grid", "gap-x-4", "grid-cols-11", "w-full"),
          Classes.TEXT_MUTED
        )}
      >
        <div className={tw("col-span-2", "pl-4")}>{t`Pool`}</div>
        <div className={tw("pl-2")}>{t`Term`}</div>
        <div className={tw("pl-2")}>{t`Liquidity`}</div>
        <div>{t`Vault APY`}</div>
        <div>{t`Fixed APY`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Price`}</div>
        <div className={tw("col-span-2")}>{t`Status`}</div>
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
