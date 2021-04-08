import React, { FC } from "react";

import { Select } from "@blueprintjs/select";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

import { TermButton } from "./TermButton";

interface TermPickerProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  baseAsset: CryptoAsset | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
  buttonLabelRenderer: (
    tranche: Tranche | undefined,
    baseAsset: CryptoAssetWithIcon | undefined
  ) => JSX.Element;
}

/**
 * A simple component for
 */
export const TermPicker: FC<TermPickerProps> = ({
  baseAsset,
  tranches,
  account,
  library,
  onTrancheChange,
  activeTrancheIndex,
  buttonLabelRenderer,
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
        <TermButton
          library={library}
          account={account}
          tranche={tranche}
          onClick={handleClick}
          buttonLabelRenderer={buttonLabelRenderer}
        />
      )}
      onItemSelect={onTrancheChange}
    >
      <TermButton
        library={library}
        account={account}
        tranche={activeTranche}
        buttonLabelRenderer={buttonLabelRenderer}
      />
    </Select>
  );
};
