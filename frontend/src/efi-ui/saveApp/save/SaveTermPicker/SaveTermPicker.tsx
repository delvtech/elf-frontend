import React, { ReactElement } from "react";

import { Tranche } from "elf-contracts/types/Tranche";

import { PrincipalTokenTermButtonLabel } from "efi-ui/tranche/TermPicker/PrincipalTokenTermButtonLabel";
import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import tw from "efi-tailwindcss-classnames";

interface SaveTermPickerProps {
  account: string | null | undefined;
  tranches: Tranche[];
  baseAsset: CryptoAsset;
  activeTrancheIndex: number;
  onTrancheChange: (newTranche: Tranche) => void;
}

export function SaveTermPicker({
  tranches,
  account,
  baseAsset,
  onTrancheChange,
  activeTrancheIndex,
}: SaveTermPickerProps): ReactElement | null {
  if (tranches.length === 1) {
    return (
      <PrincipalTokenTermButtonLabel
        tranche={tranches[0]}
        baseAsset={baseAsset}
        className={tw("pl-4")}
      />
    );
  }
  return (
    <TermPicker
      account={account}
      activeTrancheIndex={activeTrancheIndex}
      buttonLabelRenderer={buttonLabelRenderer}
      onTrancheChange={onTrancheChange}
      tranches={tranches}
    />
  );
}

function buttonLabelRenderer(tranche: Tranche, baseAsset: CryptoAsset) {
  return (
    <PrincipalTokenTermButtonLabel tranche={tranche} baseAsset={baseAsset} />
  );
}
