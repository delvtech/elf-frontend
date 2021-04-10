import { ReactElement } from "react";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatFullDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";

/**
 * Generalize this further to handle any transaction confirmation
 */
interface MintTransactionDetailsProps {
  spotPriceBaseAssetForOneToken: number | undefined;
  baseAssetSymbol: string | undefined;

  priceSlippageAndTradingFee: number | undefined;

  unlockTimeStamp: Date | undefined;
}
export function MintTransactionDetails({
  baseAssetSymbol,
  priceSlippageAndTradingFee,
  spotPriceBaseAssetForOneToken,
  unlockTimeStamp,
}: MintTransactionDetailsProps): ReactElement {
  const roundedTranchePrice = spotPriceBaseAssetForOneToken?.toFixed(4);

  const unlockTimeStampLabel = unlockTimeStamp
    ? formatFullDate(unlockTimeStamp)
    : undefined;

  const formattedSlippageAndTradingFee = formatPercent(
    priceSlippageAndTradingFee || 0
  );

  return (
    <div className={tw("flex", "flex-col", "space-y-6", "items-center")}>
      <LabeledText
        bold
        muted={false}
        className={tw("items-center")}
        text={<span>{t`Principal Tokens you receive`}</span>}
        label={
          <span
            className={tw("text-base")}
          >{t`1 Principal Token ≈ ${roundedTranchePrice} ${baseAssetSymbol}`}</span>
        }
      />
      <LabeledText
        muted={false}
        bold
        className={tw("items-center")}
        text={<span>{t`Yield Tokens you receive`}</span>}
        label={
          <span className={tw("text-base")}>
            {formattedSlippageAndTradingFee}
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
