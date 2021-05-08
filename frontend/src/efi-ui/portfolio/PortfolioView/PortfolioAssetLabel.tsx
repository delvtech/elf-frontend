import React, { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatMoney } from "efi/money/formatMoney";

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
  const quantityLabel = formatMoney(totalFiatValue);
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
      {/*
        <Tag
          className={tw("hidden", "lg:block")}
          minimal
          round={!!quantity}
          large={!!quantity}
          intent={!quantity ? Intent.WARNING : Intent.NONE}
        >
          {quantity ? quantity : t`Learn more`}
        </Tag>
        */}
    </div>
  );
}
