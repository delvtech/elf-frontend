import React, { Fragment, ReactElement } from "react";

import { Callout, Colors } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface PrincipalDiscountPreviewProps {
  amountIn: BigNumber | undefined;
  amountOut: BigNumber | undefined;
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

export function PrincipalDiscountPreview({
  amountIn,
  amountOut,
  baseAssetSymbol,
  baseAssetDecimals,
}: PrincipalDiscountPreviewProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const totalYield = calculateTotalYield(
    amountOut,
    amountIn,
    baseAssetDecimals
  );

  const percentYield = calculatePercentYield(
    amountIn,
    baseAssetDecimals,
    totalYield
  );
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
        label={<span className={tw("text-base")}>{t`Yield at term`}</span>}
        textClassName={tw("text-lg")}
        text={
          !amountIn ? (
            t`Enter an amount`
          ) : (
            <Fragment>
              <span>{`${totalYield.toFixed(4)} ${baseAssetSymbol}`}</span>{" "}
              <span
                style={{
                  color: isDarkMode ? Colors.GREEN5 : Colors.GREEN3,
                }}
              >{`(+${percentYield?.toFixed(2)}%)`}</span>
            </Fragment>
          )
        }
      />
    </Callout>
  );
}

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
