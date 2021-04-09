import React from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { useBaseAssetForTranche } from "efi-ui/tranche/useBaseAssetForTranche";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";

interface TrancheButtonProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche | undefined;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * If true will show the dropdown caret, defaults to true
   */
  showCaret?: boolean;
  buttonLabelRenderer: (
    tranche: Tranche | undefined,
    baseAsset: CryptoAssetWithIcon | undefined
  ) => JSX.Element;
}

export function TermButton({
  tranche,
  buttonLabelRenderer,
  showCaret = true,
  onClick,
}: TrancheButtonProps): JSX.Element {
  const baseAsset = useBaseAssetForTranche(tranche);
  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.FILL,
        Classes.MINIMAL,
        tw("flex", "justify-start", "w-64")
      )}
      style={{ height: "82px" }}
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
