import React, { ReactElement } from "react";

import { Select } from "@blueprintjs/select";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";

import { TermButton } from "./TermButton";
import styles from "./TermPicker.module.css";
import classNames from "classnames";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface TermPickerProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  baseAsset: CryptoAsset | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
  buttonLabelRenderer: (
    tranche: Tranche | undefined,
    baseAsset: CryptoAsset | undefined
  ) => JSX.Element;
}

export function TermPicker({
  baseAsset,
  tranches,
  account,
  library,
  onTrancheChange,
  activeTrancheIndex,
  buttonLabelRenderer,
}: TermPickerProps): ReactElement | null {
  // TODO: Show a loading or disabled state of some kind
  if (!tranches.length || activeTrancheIndex === undefined) {
    return null;
  }

  const activeTranche = tranches[activeTrancheIndex];

  return (
    <Select
      disabled={tranches.length < 2}
      className={tw("pr-2")}
      popoverProps={{
        minimal: true,
        className: tw("w-full"),
        targetClassName: classNames(styles.fullHeight, tw("w-full", "h-full")),
        popoverClassName: tw("w-full", "h-full"),
        portalClassName: tw("w-64"),
      }}
      items={tranches}
      filterable={false}
      itemRenderer={(tranche, { handleClick }) => (
        <TermButton
          key={tranche?.address}
          showCaret={false}
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
        disabled={tranches.length < 2}
        library={library}
        account={account}
        tranche={activeTranche}
        buttonLabelRenderer={buttonLabelRenderer}
      />
    </Select>
  );
}
