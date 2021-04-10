import { ReactElement } from "react";

import { Callout } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";

interface PrincipalTokenPreviewProps {
  /**
   * The number of principal tokens to display
   */
  amount: number | undefined;
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

export function PrincipalTokenPreview({
  amount,
  baseAssetSymbol,
}: PrincipalTokenPreviewProps): ReactElement {
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
        label={<span className={tw("text-base")}>{t`Principal Tokens`}</span>}
        textClassName={tw("text-lg")}
        text={
          !amount ? (
            t`Enter an amount`
          ) : (
            <span>{`${amount.toFixed(4)} ${baseAssetSymbol}`}</span>
          )
        }
      />
    </Callout>
  );
}
