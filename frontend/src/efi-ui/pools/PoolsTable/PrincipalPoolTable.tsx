import { CSSProperties, ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/pools/PoolsTable/grid.module.css";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { openPrincipalPools, principalPools } from "efi/pools/ccpool";

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

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "space-y-5")}
      style={principalPoolTableStyle}
    >
      <div
        className={classNames(
          styles.principalPoolGrid,
          Classes.TEXT_MUTED,
          // padding to match Card default padding, keeps text alignment correct
          // with card content
          tw("px-5")
        )}
      >
        <div>{t`Pool`}</div>
        <div>{t`Liquidity`}</div>
        <div className={tw("font-bold")}>{t`Fixed APR`}</div>
        <div>{t`LP APY`}</div>
        <div>{t`Vault APY`}</div>
        <div>{t`Price`}</div>
        <div>{t`Term`}</div>
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
