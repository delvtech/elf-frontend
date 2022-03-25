import { ReactElement } from "react";
import classNames from "classnames";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import styles from "ui/fixedrates/grid.module.css";

interface FixedRateCardListHeaderProps {
  hide?: boolean;
}

export function FixedRateCardListHeader(
  props: FixedRateCardListHeaderProps,
): ReactElement | null {
  if (props.hide) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.fixedRatesGrid,
        tw("text-base", "text-left", "pb-2"),
      )}
    >
      <span>{t`Featured Principal Tokens`}</span>
      <span>{t`Term Period`}</span>
      <span>{t`Fixed APR`}</span>
      <span />
    </div>
  );
}
