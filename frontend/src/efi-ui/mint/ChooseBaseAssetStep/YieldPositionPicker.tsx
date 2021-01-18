import React, { FC } from "react";
import { Button } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { Select } from "@blueprintjs/select";
import { IconNames } from "@blueprintjs/icons";

export const YieldPositionPicker: FC<YieldPositionPickerProps> = ({
  yieldPositions,
  setActiveYieldPositionIndex,
  activeYieldPosition,
}) => {
  return (
    <div className={tw("grid", "grid-cols-2", "w-full")}>
      <span>{t`Yield position:`}</span>
      <Select
        popoverProps={{ minimal: true }}
        items={yieldPositions}
        filterable={false}
        itemRenderer={({ name, apy }) => (
          <div className={tw("p-2", "text-base")}>
            <LabeledText text={t`${apy} APY`} label={name} />
          </div>
        )}
        onItemSelect={({ id }) => {
          setActiveYieldPositionIndex(
            yieldPositions.findIndex((yieldPosition) => id === yieldPosition.id)
          );
        }}
      >
        <Button fill outlined rightIcon={IconNames.CARET_DOWN}>
          <LabeledText
            className={tw("pr-6", "text-base")}
            text={t`${activeYieldPosition.apy} APY`}
            label={activeYieldPosition.name}
          />
        </Button>
      </Select>
    </div>
  );
};
interface YieldPositionPickerProps {
  yieldPositions: {
    id: string;
    name: string;
    apy: string;
  }[];
  setActiveYieldPositionIndex: React.Dispatch<React.SetStateAction<number>>;
  activeYieldPosition: {
    id: string;
    name: string;
    apy: string;
  };
}
