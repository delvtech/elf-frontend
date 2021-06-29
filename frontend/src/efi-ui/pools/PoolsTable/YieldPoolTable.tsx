import { CSSProperties, ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { YieldPoolCard } from "efi-ui/pools/PoolsTable/YieldPoolCard";
import { openYieldPools, yieldPools } from "efi/pools/weightedPool";

interface YieldPoolTableProps {
  showMaturePools?: boolean;
}

const yieldPoolTableStyle: CSSProperties = {
  minWidth: 800,
};
export function YieldPoolTable({
  showMaturePools = true,
}: YieldPoolTableProps): ReactElement {
  const yieldPoolsToShow = showMaturePools ? yieldPools : openYieldPools;

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
      style={yieldPoolTableStyle}
    >
      <div
        className={classNames(
          tw("grid", "gap-x-6", "grid-cols-8", "w-full"),
          Classes.TEXT_MUTED
        )}
      >
        <div className={tw("col-span-2", "pl-4")}>{t`Pool`}</div>
        <div className={tw("pl-2")}>{t`Pool Liquidity`}</div>
        <div>{t`Vault APY`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Price`}</div>
        <div>{t`Term`}</div>
        {/* Actions */}
        <div />
      </div>
      {yieldPoolsToShow.map((poolInfo) => {
        return (
          <YieldPoolCard key={poolInfo.address} yieldPoolInfo={poolInfo} />
        );
      })}
    </div>
  );
}
