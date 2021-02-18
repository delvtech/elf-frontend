import React, { FC } from "react";

import { Select } from "@blueprintjs/select";

import tw from "efi-tailwindcss-classnames";

import { TrancheInfo } from "../../tranche/TrancheInfo";
import { TrancheInfoButton } from "./TrancheInfoButton";

interface TranchePickerProps {
  trancheInfos: TrancheInfo[];
  activeTrancheInfoId: string;
  onTrancheInfoChange: (newTrancheInfo: TrancheInfo) => void;
}
export const TranchePicker: FC<TranchePickerProps> = ({
  trancheInfos,
  onTrancheInfoChange,
  activeTrancheInfoId,
}) => {
  const {
    apy: activeTrancheAPY,
    maturity: activeTrancheMaturity,
    symbol: activeTrancheSymbol,
    name: activeTrancheName,
  } = trancheInfos.find(({ id }) => activeTrancheInfoId === id) as TrancheInfo;

  return (
    <Select
      disabled
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={trancheInfos}
      filterable={false}
      className={tw("w-full", "col-span-2")}
      itemRenderer={({ name, apy, symbol, maturity }, { handleClick }) => (
        <TrancheInfoButton
          name={name}
          apy={apy}
          symbol={symbol}
          maturity={maturity}
          onClick={handleClick}
        />
      )}
      onItemSelect={onTrancheInfoChange}
    >
      <TrancheInfoButton
        name={activeTrancheName}
        symbol={activeTrancheSymbol}
        apy={activeTrancheAPY}
        maturity={activeTrancheMaturity}
      />
    </Select>
  );
};
