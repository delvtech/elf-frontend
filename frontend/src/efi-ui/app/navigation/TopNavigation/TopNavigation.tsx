import { ReactElement } from "react";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

import tw from "efi-tailwindcss-classnames";
import { NavigationMenuButton } from "efi-ui/app/navigation/TopNavigation/NavigationMenuButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletButton2 } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton2";

interface TopNavigationProps {
  walletConnectionActive: boolean | undefined;
  chainId: number | undefined;
  account: string | null | undefined;
}
export function TopNavigation(props: TopNavigationProps): ReactElement {
  const { isDarkMode, setDarkModeOff, setDarkModeOn } = useDarkMode();

  const { walletConnectionActive, chainId, account } = props;

  return (
    <div
      className={tw(
        // only show on large screens since we have the topbar on small screens
        "hidden",
        "lg:flex",
        "space-x-4",
        "w-full",
        "justify-end"
      )}
    >
      <Button
        minimal
        className={tw("px-6")}
        icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
        onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
      />
      <ConnectWalletButton2
        account={account}
        chainId={chainId}
        walletConnectionActive={walletConnectionActive}
      />

      <NavigationMenuButton />
    </div>
  );
}
