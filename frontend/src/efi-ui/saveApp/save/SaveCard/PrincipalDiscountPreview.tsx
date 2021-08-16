import { ReactElement } from "react";

import { Callout, Colors } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { isFiniteNumber } from "efi/base/numbers";
import { commify } from "ethers/lib/utils";
import { useIsTailwindLargeScreen } from "efi-ui/base/mediaBreakpoints";

interface PrincipalDiscountPreviewProps {
  amountIn: string | undefined;
  amountOut: string | undefined;
  baseAssetSymbol: string | undefined;
}

export function PrincipalDiscountPreview(
  props: PrincipalDiscountPreviewProps
): ReactElement {
  const { amountIn, amountOut, baseAssetSymbol } = props;
  const { isDarkMode } = useDarkMode();
  const amountInNumber = amountIn ? +amountIn : undefined;
  const amountOutNumber = amountOut ? +amountOut : undefined;
  const totalYield = calculateTotalYield(amountOutNumber, amountInNumber);
  const percentYield = calculatePercentYield(amountInNumber, totalYield);
  const isLargeScreen = useIsTailwindLargeScreen();

  if (isLargeScreen) {
    return (
      <Callout
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "h-full",
          "p-8",
          "items-center",
          "justify-center"
        )}
      >
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
          label={
            <span className={tw("text-base")}>{t`Earned at Maturity`}</span>
          }
          textClassName={tw("text-base")}
          text={
            <div>
              {totalYield && isFiniteNumber(totalYield)
                ? `${commify(totalYield.toFixed(4))} ${baseAssetSymbol}`
                : `${0} ${baseAssetSymbol}`}{" "}
              <span
                style={{
                  color:
                    totalYield && isFiniteNumber(totalYield)
                      ? isDarkMode
                        ? Colors.GREEN5
                        : Colors.GREEN3
                      : "inherit",
                }}
              >
                {percentYield ? `(+${percentYield?.toFixed(2)}%)` : null}
              </span>
            </div>
          }
        />
      </Callout>
    );
  }

  return (
    <Callout
      className={tw(
        "flex",
        "items-center",
        "justify-between",
        "p-2",
        "text-xs"
      )}
    >
      <div>{t`Earned at Maturity`}</div>
      <div>
        {totalYield && isFiniteNumber(totalYield)
          ? `${commify(totalYield.toFixed(4))} ${baseAssetSymbol}`
          : `${0} ${baseAssetSymbol}`}{" "}
        <span
          style={{
            color:
              totalYield && isFiniteNumber(totalYield)
                ? isDarkMode
                  ? Colors.GREEN5
                  : Colors.GREEN3
                : "inherit",
          }}
        >
          {percentYield ? `(+${percentYield?.toFixed(2)}%)` : null}
        </span>
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
  if (!amountIn || !totalYield) {
    return;
  }

  const percentYield = (totalYield / amountIn) * 100;
  return percentYield;
}
