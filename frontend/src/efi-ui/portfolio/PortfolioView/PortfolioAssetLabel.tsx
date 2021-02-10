import React, { FC, useMemo } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";

export const PortfolioAssetLabel: FC<PortfolioAssetLabelProps> = ({ name }) => {
  // TODO: get this from props
  const numAssets = useMemo(() => Math.round(Math.random() * 2), []);
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
        label={numAssets ? "$50,281.09" : "$0.00"}
        className={tw("leading-none", "space-y-2")}
      />
      <Tag
        minimal
        round={!!numAssets}
        large={!!numAssets}
        intent={!numAssets ? Intent.WARNING : Intent.NONE}
      >
        {!!numAssets ? numAssets : t`Learn more`}
      </Tag>
    </div>
  );
};
interface PortfolioAssetLabelProps {
  id: string;
  name: string;
}
