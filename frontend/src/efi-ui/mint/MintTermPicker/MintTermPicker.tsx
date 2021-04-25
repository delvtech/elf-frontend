import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";

import { TermPicker } from "efi-ui/tranche/TermPicker/TermPicker";
import { VaultTermButtonLabel } from "efi-ui/tranche/TermPicker/VaultTermButtonLabel";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface MintTermPickerProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  baseAsset: CryptoAsset | undefined;
  tranches: Tranche[];
  activeTrancheIndex: number | undefined;
  onTrancheChange: (newTranche: Tranche) => void;
}

export function MintTermPicker({
  baseAsset,
  tranches,
  account,
  library,
  onTrancheChange,
  activeTrancheIndex,
}: MintTermPickerProps): ReactElement | null {
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
  baseAsset: CryptoAsset | undefined
) {
  return <VaultTermButtonLabel tranche={tranche} baseAsset={baseAsset} />;
}
