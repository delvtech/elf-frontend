import { ReactElement } from "react";

import { Drawer } from "@blueprintjs/core";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import { ConnectWalletCallout } from "./ConnectWalletCallout";

interface WalletDrawerProps {
  account: string | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactElement;
}

/**
 * A simple drawer component that contains a wallet connection step.
 */
export function WalletDrawer({
  account,
  isOpen,
  onClose,
  children,
}: WalletDrawerProps): ReactElement {
  const { isDarkMode, darkModeClassName } = useDarkMode();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size={500}
      style={!isDarkMode ? { background: "var(--bp3-bg-color)" } : {}}
      className={classNames(
        darkModeClassName,
        tw(
          "flex",
          "flex-col",
          "justify-between",
          "text-base",
          "overflow-scroll",
          "p-10",
          {
            "text-gray-700": !isDarkMode,
            "text-white": isDarkMode,
          }
        )
      )}
    >
      {!account ? <ConnectWalletCallout /> : null}

      {children}
    </Drawer>
  );
}
