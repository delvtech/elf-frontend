import React, { ReactElement } from "react";
import { Money } from "ts-money";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";

interface PortfolioAssetLabelProps {
  id: string;
  name: string;
  quantity: number;
  totalFiatValue: Money;
}

export function PortfolioAssetLabel({
  quantity,
  name,
  totalFiatValue,
}: PortfolioAssetLabelProps): ReactElement {
  return (
    <div
      className={tw(
        "flex",
        "py-6",
        "px-2",
        "w-full",
        "space-x-8",
        "justify-center",
        "items-center"
      )}
    >
      <LabeledText
        text={name}
        label={""}
        className={tw("leading-none", "space-y-2")}
      />
    </div>
  );
}
