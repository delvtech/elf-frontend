import React, { FC } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { formatMoney } from "efi/money/formatMoney";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

interface PortfolioAssetLabelProps {
  id: string;
  name: string;
  quantity: number;

  totalFiatValue: Money | undefined;
}

export const PortfolioAssetLabel: FC<PortfolioAssetLabelProps> = ({
  quantity,
  name,
  totalFiatValue,
}) => {
  const { currency } = useCurrencyPref();
  const quantityLabel = `${currency.symbol}${formatMoney(totalFiatValue)}`;
  return (
    <div
      className={tw(
        "flex",
        "p-6",
        "w-full",
        "space-x-16",
        "justify-between",
        "items-center"
      )}
    >
      <LabeledText
        text={name}
        label={quantityLabel}
        className={tw("leading-none", "space-y-2")}
      />
      <Tag
        className={tw("hidden", "lg:block")}
        minimal
        round={!!quantity}
        large={!!quantity}
        intent={!quantity ? Intent.WARNING : Intent.NONE}
      >
        {quantity ? quantity : t`Learn more`}
      </Tag>
    </div>
  );
};
