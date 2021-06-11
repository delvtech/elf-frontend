import { ReactElement } from "react";

import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatPercent } from "efi/base/formatPercent";
import { TermAssetType } from "efi/tranche/TermAssetType";

/**
 * Generalize this further to handle any transaction confirmation
 */
interface SwapTokenDetailsProps {
  spotPriceBaseAssetForOneToken: number | undefined;
  baseAssetSymbol: string | undefined;
  priceSlippage: number | undefined;
  feePercent: number | undefined;
  termAssetType: TermAssetType;
}
export function SwapTokenDetails({
  baseAssetSymbol,
  priceSlippage,
  feePercent,
  spotPriceBaseAssetForOneToken = 0,
  termAssetType,
}: SwapTokenDetailsProps): ReactElement {
  const roundedTermAssetPrice = (1 / spotPriceBaseAssetForOneToken).toFixed(4);
  let label = t`1 Principal Token ≈ ${roundedTermAssetPrice} ${baseAssetSymbol}`;
  if (termAssetType === "yield") {
    label = t`1 Yield Token ≈ ${roundedTermAssetPrice} ${baseAssetSymbol}`;
  }

  const formattedSlippage = formatPercent(priceSlippage || 0);
  const formattedFeePercent = formatPercent(feePercent || 0);

  return (
    <div className={tw("flex", "flex-col", "space-y-6", "items-center")}>
      <LabeledText
        bold
        muted={false}
        containerClassName={tw("justify-center")}
        className={tw("items-center")}
        text={<span>{t`Market rate`}</span>}
        label={<span className={tw("text-base")}>{label}</span>}
      />
      <LabeledText
        muted={false}
        bold
        containerClassName={tw("justify-center")}
        text={<span>{t`Fees`}</span>}
        className={tw("items-center")}
        label={<span className={tw("text-base")}>{formattedFeePercent}</span>}
      />
      <LabeledText
        muted={false}
        bold
        containerClassName={tw("justify-center")}
        text={<span>{t`Price impact`}</span>}
        className={tw("items-center")}
        label={<span className={tw("text-base")}>{formattedSlippage}</span>}
      />
    </div>
  );
}
