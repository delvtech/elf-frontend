import React, { FC, Fragment } from "react";

import { Callout } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatUnits } from "ethers/lib/utils";

interface YieldTokenPreviewProps {
  /**
   * The number of yield tokens to display
   */
  amount: number | undefined;
  baseAssetSymbol: string | undefined;
  baseAssetDecimals: number | undefined;
}

const calloutClassName = tw(
  "flex",
  "flex-col",
  "flex-1",
  "h-full",
  "p-8",
  "items-center",
  "justify-center"
);

export const YieldTokenPreview: FC<YieldTokenPreviewProps> = ({
  amount,
  baseAssetSymbol,
}) => {
  return (
    <Callout className={calloutClassName}>
      <LabeledText
        muted={false}
        bold
        className={tw(
          "flex",
          "justify-center",
          "flex-col-reverse",
          "items-center"
        )}
        label={<span className={tw("text-base")}>{t`Yield Tokens`}</span>}
        textClassName={tw("text-lg")}
        text={
          !amount ? (
            t`Enter an amount`
          ) : (
            <span>{`${amount.toFixed(4)} yt${baseAssetSymbol}`}</span>
          )
        }
      />
    </Callout>
  );
};

/**
 * Because Principal tokens converges to the full value of the base asset,
 * calculating total yield is simply the difference between what you got out
 * for what you put in.
 */
function calculateTotalYield(
  amountOut: BigNumber | undefined,
  amountIn: BigNumber | undefined,
  decimalsAmountIn: number | undefined
) {
  let totalYield = 0;
  if (amountOut) {
    const yieldAsBigNumber = amountOut.sub(amountIn || 0);
    totalYield = +formatUnits(yieldAsBigNumber, decimalsAmountIn);
  }
  return totalYield;
}

function calculatePercentYield(
  amountIn: BigNumber | undefined,
  tokenInDecimals: number | undefined,
  totalYield: number
): number | undefined {
  if (!amountIn || !tokenInDecimals) {
    return;
  }

  const amountInAsNumber = +formatUnits(amountIn, tokenInDecimals);
  const percentYield = (totalYield / amountInAsNumber) * 100;
  return percentYield;
}
