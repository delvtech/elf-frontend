import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { PrincipalTokenTermButtonLabel } from "efi-ui/tranche/TermPicker/PrincipalTokenTermButtonLabel";

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
  // TODO: Show a loading or disabled state of some kind
  if (!tranches.length || activeTrancheIndex === undefined) {
    return null;
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
  baseAsset: CryptoAssetWithIcon | undefined
) {
  return (
    <PrincipalTokenTermButtonLabel tranche={tranche} baseAsset={baseAsset} />
  );
}
