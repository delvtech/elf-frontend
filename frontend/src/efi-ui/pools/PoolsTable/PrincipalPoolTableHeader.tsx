import { ReactElement } from "react";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import styles from "efi-ui/pools/PoolsTable/grid.module.css";

interface PrincipalPoolTableHeaderProps {
  className?: string;
}

export function PrincipalPoolTableHeader({
  className,
}: PrincipalPoolTableHeaderProps): ReactElement {
  return (
    <div
      className={classNames(
        tw(
          // padding to match Card default padding, keeps text alignment correct
          // with card content
          "px-5"
        ),
        styles.principalPoolGridColumns,
        Classes.TEXT_MUTED,
        className
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
  );
}
