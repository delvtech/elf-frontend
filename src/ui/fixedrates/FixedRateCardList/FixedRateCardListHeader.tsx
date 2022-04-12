import { ReactElement } from "react";
import classNames from "classnames";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import styles from "ui/fixedrates/grid.module.css";
import { useFeatureFlag } from "elf/featureFlag/useFeatureFlag";
import { FeatureFlag } from "elf/featureFlag/featureFlag";

interface FixedRateCardListHeaderProps {
  hide?: boolean;
}

export function FixedRateCardListHeader(
  props: FixedRateCardListHeaderProps,
): ReactElement | null {
  const featureFlagZapSwapCurve = useFeatureFlag(FeatureFlag.ZAP_SWAP_CURVE);
  if (props.hide) {
    return null;
  }

  return (
    <div
      className={classNames(
        featureFlagZapSwapCurve
          ? styles.fixedRatesZapGrid
          : styles.fixedRatesGrid,
        tw("text-base", "text-left", "pb-2"),
      )}
    >
      <span>{t`Principal Tokens`}</span>
      {featureFlagZapSwapCurve ? <span>{t`Input Tokens`}</span> : null}
      <span>{t`Term Period`}</span>
      <span>{t`Fixed APR`}</span>
      <span />
    </div>
  );
}
