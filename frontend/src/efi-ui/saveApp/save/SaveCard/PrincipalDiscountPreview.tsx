import React, { Fragment, ReactElement } from "react";

import { Callout, Colors } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatPercent } from "efi/base/formatPercent";
import { isFiniteNumber } from "efi/base/numbers";

interface PrincipalDiscountPreviewProps {
  amountIn: string | undefined;
  amountOut: string | undefined;
  baseAssetSymbol: string | undefined;
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

export function PrincipalDiscountPreview(
  props: PrincipalDiscountPreviewProps
): ReactElement {
  const { amountIn, amountOut, baseAssetSymbol } = props;
  const { isDarkMode } = useDarkMode();
  const amountInNumber = amountIn ? +amountIn : undefined;
  const amountOutNumber = amountOut ? +amountOut : undefined;
  const totalYield = calculateTotalYield(amountOutNumber, amountInNumber);
  const percentYield = calculatePercentYield(amountInNumber, totalYield);

  return (
    <Callout className={calloutClassName}>
      <LabeledText
        muted={false}
        bold
        containerClassName={tw("justify-center")}
        className={tw(
          "flex",
          "justify-center",
          "flex-col-reverse",
          "items-center"
        )}
        label={<span className={tw("text-base")}>{t`Earned at Maturity`}</span>}
        textClassName={tw("text-lg")}
        text={
          <Fragment>
            <span>
              {totalYield && isFiniteNumber(totalYield)
                ? `${totalYield?.toFixed(4)} ${baseAssetSymbol}`
                : `${0} ${baseAssetSymbol}`}
            </span>{" "}
            <span
              style={{
                color: isDarkMode ? Colors.GREEN5 : Colors.GREEN3,
              }}
            >
              {isFiniteNumber(percentYield) && formatPercent(percentYield)}
            </span>
          </Fragment>
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
  amountOut: number | undefined,
  amountIn: number | undefined
): number | undefined {
  if (amountOut === undefined || amountIn === undefined) {
    return;
  }
  if (amountOut < amountIn) {
    return 0;
  }
  const totalYield = amountOut - amountIn;
  return totalYield;
}

function calculatePercentYield(
  amountIn: number | undefined,
  totalYield: number | undefined
): number | undefined {
  if (amountIn === undefined || totalYield === undefined) {
    return;
  }

  const percentYield = totalYield / amountIn;
  return percentYield;
}
