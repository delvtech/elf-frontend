import React, { FC } from "react";

import { Select } from "@blueprintjs/select";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";

import { TrancheButton } from "./TrancheButton";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface TranchePickerProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  baseAsset: CryptoAsset | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}

export const TranchePicker: FC<TranchePickerProps> = ({
  baseAsset,
  tranches,
  account,
  library,
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
        <TrancheButton
          baseAsset={baseAsset}
          library={library}
          account={account}
          tranche={tranche}
          onClick={handleClick}
        />
      )}
      onItemSelect={onTrancheChange}
    >
      <TrancheButton
        baseAsset={baseAsset}
        library={library}
        account={account}
        tranche={activeTranche}
      />
    </Select>
  );
};
