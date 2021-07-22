import { CSSProperties, ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/pools/PoolsTable/grid.module.css";
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
          // padding to match Card default padding, keeps text alignment correct
          // with card content
          tw("px-5", "hidden", "lg:grid"),
          styles.yieldPoolGridColumns,
          Classes.TEXT_MUTED
        )}
      >
        <div>{t`Pool`}</div>
        <div>{t`Liquidity`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Vault APY`}</div>
        <div>{t`Price`}</div>
        <div>{t`Term`}</div>
      </div>
      {[...yieldPoolsToShow]
        .sort((info) => info.extensions.createdAtTimestamp)
        .reverse()
        .map((poolInfo) => {
          return (
            <YieldPoolCard key={poolInfo.address} yieldPoolInfo={poolInfo} />
          );
        })}
    </div>
  );
}
