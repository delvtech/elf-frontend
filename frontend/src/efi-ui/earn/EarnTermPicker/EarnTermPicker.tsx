import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { PrincipalTokenTermButtonLabel } from "efi-ui/tranche/TermPicker/PrincipalTokenTermButtonLabel";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import tw from "efi-tailwindcss-classnames";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

interface EarnTermPickerProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  baseAsset: CryptoAsset | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}

export function EarnTermPicker({
  baseAsset,
  tranches,
  account,
  library,
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
      baseAsset={baseAsset}
      account={account}
      activeTrancheIndex={activeTrancheIndex}
      buttonLabelRenderer={buttonLabelRenderer}
      library={library}
      onTrancheChange={onTrancheChange}
      tranches={tranches}
    />
  );
}

function buttonLabelRenderer(
  tranche: Tranche | undefined,
  baseAsset: CryptoAsset | undefined
) {
  return (
    <PrincipalTokenTermButtonLabel tranche={tranche} baseAsset={baseAsset} />
  );
}
