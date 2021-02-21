import React, { FC } from "react";

import { Select } from "@blueprintjs/select";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";

import { TrancheInfoButton } from "./TrancheInfoButton";

interface TranchePickerProps {
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}
export const TranchePicker: FC<TranchePickerProps> = ({
  tranches,
  onTrancheChange,
  activeTrancheIndex,
}) => {
  // TODO: Show a loading or disabled state of some kind
  if (!tranches.length || activeTrancheIndex === undefined) {
    return null;
  }

  const activeTranche = tranches[activeTrancheIndex];

  return (
    <Select
      disabled
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={tranches}
      filterable={false}
      className={tw("w-full", "col-span-2")}
      itemRenderer={(tranche, { handleClick }) => (
        <TrancheInfoButton tranche={tranche} onClick={handleClick} />
      )}
      onItemSelect={onTrancheChange}
    >
      <TrancheInfoButton tranche={activeTranche} />
    </Select>
  );
};
