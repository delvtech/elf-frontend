import { ReactElement } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatPercent } from "efi/base/formatPercent";

/**
 * Generalize this further to handle any transaction confirmation
 */
interface SwapTokenDetailsProps {
  spotPriceBaseAssetForOneToken: number | undefined;
  baseAssetSymbol: string | undefined;
  priceSlippage: number | undefined;
  feePercent: number | undefined;
}
export function SwapTokenDetails({
  baseAssetSymbol,
  priceSlippage,
  feePercent,
  spotPriceBaseAssetForOneToken,
}: SwapTokenDetailsProps): ReactElement {
  const roundedTranchePrice = spotPriceBaseAssetForOneToken?.toFixed(4);

  const formattedSlippage = formatPercent(priceSlippage || 0);
  const formattedFeePercent = formatPercent(feePercent || 0);

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
        text={<span>{t`Fees`}</span>}
        className={tw("items-center")}
        label={<span className={tw("text-base")}>{formattedFeePercent}</span>}
      />
      <LabeledText
        muted={false}
        bold
        text={<span>{t`Price impact`}</span>}
        className={tw("items-center")}
        label={<span className={tw("text-base")}>{formattedSlippage}</span>}
      />
    </div>
  );
}
