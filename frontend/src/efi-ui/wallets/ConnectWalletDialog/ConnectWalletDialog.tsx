import React, { ReactElement } from "react";

import { Callout, Dialog } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

interface ConnectWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ConnectWalletDialog({
  isOpen,
  onClose,
}: ConnectWalletDialogProps): ReactElement {
  const { darkModeClassName } = useDarkMode();
  return (
    <Dialog
      className={classNames(darkModeClassName, tw("pb-0"))}
      isOpen={isOpen}
      icon={IconNames.SEND_TO_GRAPH}
      onClose={onClose}
    >
      <div
        className={tw("flex", "flex-col", "w-full", "h-full")}
        data-testid="connect-wallet-dialog"
      >
        <span
          className={tw("text-center", "text-base", "py-6")}
        >{t`Select a wallet provider`}</span>
        <Callout className={tw("p-0")}>
          <ConnectWalletButtons onClick={onClose} />
        </Callout>
      </div>
    </Dialog>
  );
}
