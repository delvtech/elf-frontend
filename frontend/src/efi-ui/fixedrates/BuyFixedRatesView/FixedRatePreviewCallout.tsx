import { ReactElement } from "react";

import { Callout } from "@blueprintjs/core";
import classNames from "classnames";
import { BigNumber } from "ethers";
import { commify, formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getSafeFixedNumber } from "efi/base/math/fixedPoint";

interface FixedRatePreviewCalloutProps {
  principalTokensOut: string;
  baseAssetIn: string;
  baseAssetDecimals: number;
}

const reviewOrderGridRowClassName = tw(
  "w-full",
  "grid",
  "grid-cols-3",
  "text-left"
);

export function FixedRatePreviewCallout(
  props: FixedRatePreviewCalloutProps
): ReactElement {
  const { principalTokensOut, baseAssetDecimals, baseAssetIn } = props;
  const { isDarkMode } = useDarkMode();
  const totalTokensEarned = calculateTotalYield(
    principalTokensOut,
    baseAssetIn,
    baseAssetDecimals
  );
  const roundedTotalTokensEarned = commify((+totalTokensEarned)?.toFixed(4));

  const percentYield = calculatePercentYield(
    baseAssetIn,
    totalTokensEarned,
    baseAssetDecimals
  );
  const roundedPercentYield = commify((+percentYield)?.toFixed(2));
  const roundedPrincipalTokensOut = commify((+principalTokensOut)?.toFixed(4));
  return (
    <Callout
      className={tw(
        "flex",
        "flex-col",
        "items-center",
        "px-8",
        "space-y-1",
        "text-sm"
      )}
    >
      <div
        className={classNames(
          reviewOrderGridRowClassName,
          tw(isDarkMode ? "text-green-400" : "text-green-600")
        )}
      >
        <div className={tw("col-span-2")}>{t`Total Rate Earned`}</div>
        <div>{`${roundedPercentYield}%`}</div>
      </div>
      <div className={reviewOrderGridRowClassName}>
        <div className={tw("col-span-2")}>{t`Total Tokens Earned`}</div>
        <div>{roundedTotalTokensEarned}</div>
      </div>
      <div className={reviewOrderGridRowClassName}>
        <div className={tw("col-span-2")}>{t`Total Tokens Receiving`}</div>
        <div>{t`${roundedPrincipalTokensOut}`}</div>
      </div>
    </Callout>
  );
}

/**
 * Because Principal tokens converges to the full value of the base asset,
 * calculating total yield is simply the difference between what you got out
 * for what you put in.
 */
function calculateTotalYield(
  amountOut: string,
  amountIn: string,
  decimals: number
): string {
  if (!amountOut || !amountIn) {
    return "0";
  }
  const amountInBN = BigNumber.from(parseUnits(amountIn, decimals));
  const amountOutBN = BigNumber.from(parseUnits(amountOut, decimals));

  // value comparisons are safe to do in BigNumber's, because they are just
  // integers under the hood
  if (amountOutBN.lt(amountInBN)) {
    return "0";
  }

  const totalYieldBN = amountOutBN.sub(amountInBN);
  return formatUnits(totalYieldBN, decimals);
}

function calculatePercentYield(
  amountIn: string,
  totalYield: string,
  decimals: number
): number {
  if (!amountIn || !totalYield) {
    return 0;
  }

  // Actual math should be done using FixedPoint arithmetic
  const totalYieldFixedNumber = getSafeFixedNumber(totalYield, { decimals });
  const amountInFN = getSafeFixedNumber(amountIn, { decimals });
  const yieldRatio = totalYieldFixedNumber.divUnsafe(amountInFN);

  const oneHundred = getSafeFixedNumber("100", { decimals });
  const percentYield = yieldRatio.mulUnsafe(oneHundred);

  return +percentYield.toString();
}
