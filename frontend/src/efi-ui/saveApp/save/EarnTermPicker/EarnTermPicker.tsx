import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenTermButtonLabel } from "efi-ui/tranche/TermPicker/PrincipalTokenTermButtonLabel";
import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface EarnTermPickerProps {
  account: string | null | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number;
  onTrancheChange: (newTranche: Tranche) => void;
}

export function EarnTermPicker({
  tranches,
  account,
  onTrancheChange,
  activeTrancheIndex,
}: EarnTermPickerProps): ReactElement | null {
  if (!tranches.length || activeTrancheIndex === undefined) {
    return (
      <div
        className={classNames(
          Classes.SKELETON,
          tw("flex", "flex-1", "h-full", "w-300")
        )}
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
