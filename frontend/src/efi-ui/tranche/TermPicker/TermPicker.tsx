import React, { ReactElement, useCallback } from "react";

import { ItemRenderer, Select } from "@blueprintjs/select";
import classNames from "classnames";
import { Tranche } from "elf-contracts-typechain/dist/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

import { TermButton } from "./TermButton";
import styles from "./TermPicker.module.css";
import { IPopoverProps } from "@blueprintjs/core";

interface TermPickerProps {
  account: string | null | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number;
  onTrancheChange: (newTranche: Tranche) => void;
  buttonLabelRenderer: (
    tranche: Tranche,
    baseAsset: CryptoAsset
  ) => JSX.Element;
}

const popoverProps: IPopoverProps = {
  minimal: true,
  className: tw("w-full"),
  targetClassName: classNames(styles.fullHeight, tw("w-full", "h-full")),
  popoverClassName: tw("w-full", "h-full"),
  portalClassName: tw("w-64"),
};
export function TermPicker({
  tranches,
  account,
  onTrancheChange,
  activeTrancheIndex,
  buttonLabelRenderer,
}: TermPickerProps): ReactElement | null {
  const activeTranche = tranches[activeTrancheIndex];

  const itemRenderer: ItemRenderer<Tranche> = useCallback(
    (tranche: Tranche, { handleClick }) => (
      <TermButton
        key={tranche?.address}
        showCaret={false}
        account={account}
        tranche={tranche}
        onClick={handleClick}
        buttonLabelRenderer={buttonLabelRenderer}
      />
    ),
    [account, buttonLabelRenderer]
  );

  const hasZeroOrOneTranche = tranches.length < 2;

  return (
    <Select
      disabled={hasZeroOrOneTranche}
      className={tw("pr-2")}
      popoverProps={popoverProps}
      items={tranches}
      filterable={false}
      itemRenderer={itemRenderer}
      onItemSelect={onTrancheChange}
    >
      <TermButton
        disabled={hasZeroOrOneTranche}
        showCaret={tranches.length > 1}
        account={account}
        tranche={activeTranche}
        buttonLabelRenderer={buttonLabelRenderer}
      />
    </Select>
  );
}
