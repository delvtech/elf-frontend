import React from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { useBaseAssetForTranche } from "efi-ui/tranche/useBaseAssetForTranche";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface TrancheButtonProps {
  account: string | null | undefined;
  tranche: Tranche | undefined;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * If true will show the dropdown caret, defaults to true
   */
  showCaret?: boolean;
  buttonLabelRenderer: (
    tranche: Tranche | undefined,
    baseAsset: CryptoAsset | undefined
  ) => JSX.Element;
}

export function TermButton({
  tranche,
  disabled = false,
  buttonLabelRenderer,
  showCaret = true,
  onClick,
}: TrancheButtonProps): JSX.Element {
  const baseAsset = useBaseAssetForTranche(tranche);
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.FILL,
        Classes.MINIMAL,
        tw("flex", "justify-start", "w-64", "h-full")
      )}
    >
      <div
        className={tw(
          "flex",
          "justify-between",
          "items-center",
          "space-x-4",
          "flex-1",
          "p-2"
        )}
      >
        {buttonLabelRenderer(tranche, baseAsset)}
        {showCaret ? <Icon icon={IconNames.CARET_DOWN} /> : null}
      </div>
    </button>
  );
}
