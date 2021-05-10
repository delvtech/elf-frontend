import { ReactElement } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatFullDate } from "efi/base/dates";

/**
 * Generalize this further to handle any transaction confirmation
 */
interface MintTransactionDetailsProps {
  baseAssetSymbol: string | undefined;
  numPrincipalTokens: number | undefined;
  numYieldTokens: number | undefined;
  unlockTimestamp: Date | undefined;
}
export function MintTransactionDetails({
  baseAssetSymbol,
  numPrincipalTokens,
  numYieldTokens,
  unlockTimestamp,
}: MintTransactionDetailsProps): ReactElement {
  const unlockTimeStampLabel = unlockTimestamp
    ? formatFullDate(unlockTimestamp)
    : undefined;
  return (
    <div className={tw("flex", "flex-col", "space-y-6", "items-center")}>
      <LabeledText
        bold
        muted={false}
        className={tw("items-center")}
        text={<span>{t`Principal Tokens you receive`}</span>}
        label={
          <span className={tw("text-base")}>{t`${numPrincipalTokens?.toFixed(
            4
          )} pt${baseAssetSymbol}`}</span>
        }
      />
      <LabeledText
        muted={false}
        bold
        className={tw("items-center")}
        text={<span>{t`Yield Tokens you receive`}</span>}
        label={
          <span className={tw("text-base")}>
            {t`${numYieldTokens?.toFixed(4)} yt${baseAssetSymbol}`}
          </span>
        }
      />
      <LabeledText
        bold
        muted={false}
        text={<span>{t`Term date`}</span>}
        className={tw("items-center")}
        label={<span className={tw("text-base")}>{unlockTimeStampLabel}</span>}
      />
    </div>
  );
}
