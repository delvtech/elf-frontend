import React, { FC } from "react";

import { Dialog } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface ConnectWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
export const ConnectWalletDialog: FC<ConnectWalletDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { darkModeClassName } = useDarkMode();
  return (
    <Dialog
      className={classNames(darkModeClassName, tw("pb-0"))}
      isOpen={isOpen}
      icon={IconNames.SEND_TO_GRAPH}
      title={<span className={tw("text-base")}>{t`Connect wallet`}</span>}
      onClose={onClose}
    >
      <div
        className={tw("flex", "w-full", "h-full", "p-12")}
        data-testid="connect-wallet-dialog"
      >
        <ConnectWalletButtons onClick={onClose} />
      </div>
    </Dialog>
  );
};
