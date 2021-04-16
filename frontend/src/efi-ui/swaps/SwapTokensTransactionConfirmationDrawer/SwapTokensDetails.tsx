import { ReactElement } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatFullDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";

/**
 * Generalize this further to handle any transaction confirmation
 */
interface SwapTokenDetailsProps {
  spotPriceBaseAssetForOneToken: number | undefined;
  baseAssetSymbol: string | undefined;

  priceSlippageAndTradingFee: number | undefined;

  unlockTimeStamp: Date | undefined;
}
export function SwapTokenDetails({
  baseAssetSymbol,
  priceSlippageAndTradingFee,
  spotPriceBaseAssetForOneToken,
  unlockTimeStamp,
}: SwapTokenDetailsProps): ReactElement {
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
        text={<span>{t`Market rate`}</span>}
        label={
          <span
            className={tw("text-base")}
          >{t`1 Principal Token ≈ ${roundedTranchePrice} ${baseAssetSymbol}`}</span>
        }
      />
      <LabeledText
        muted={false}
        bold
        text={<span>{t`Price slippage + trading fees`}</span>}
        className={tw("items-center")}
        label={
          <span className={tw("text-base")}>
            {formattedSlippageAndTradingFee}
          </span>
        }
      />
      <LabeledText
        bold
        muted={false}
        className={tw("items-center")}
        text={<span>{t`Term date`}</span>}
        label={<span className={tw("text-base")}>{unlockTimeStampLabel}</span>}
      />
    </div>
  );
}
