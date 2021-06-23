import { ReactElement } from "react";

import { Tranche } from "elf-contracts/types/Tranche";

import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { VaultTermButtonLabel } from "efi-ui/tranche/TermPicker/VaultTermButtonLabel";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface MintTermPickerProps {
  account: string | null | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}

export function MintTermPicker({
  tranches,
  account,
  onTrancheChange,
  activeTrancheIndex,
}: MintTermPickerProps): ReactElement | null {
  // TODO: Show a loading or disabled state of some kind
  if (!tranches.length || activeTrancheIndex === undefined) {
    return null;
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
  return <VaultTermButtonLabel tranche={tranche} baseAsset={baseAsset} />;
}
