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
  maxWidth: 1240,
  minWidth: 1000,
};
export function YieldPoolTable({
  showMaturePools = true,
}: YieldPoolTableProps): ReactElement {
  const yieldPoolsToShow = showMaturePools ? yieldPools : openYieldPools;

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "space-y-5")}
      style={yieldPoolTableStyle}
    >
      <div
        className={classNames(
          tw("grid", "gap-x-4", "grid-cols-10", "w-full"),
          Classes.TEXT_MUTED
        )}
      >
        <div className={tw("col-span-2", "pl-4")}>{t`Pool`}</div>
        <div>{t`Term`}</div>
        <div className={tw("pl-2")}>{t`Liquidity`}</div>
        <div>{t`Vault APY`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Price`}</div>
        <div className={tw("col-span-2")}>{t`Status`}</div>
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
