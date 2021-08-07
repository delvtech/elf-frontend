import { ReactElement } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ExperimentalBanner } from "efi-ui/page/ExperimentalBanner/ExperimentalBanner";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SaveHamburgerButton } from "efi-ui/saveApp/navigation/SaveNavigation/SaveHamburgerButton";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import { AddressesJson } from "efi/addresses";
import { isGoerli, isMainnet } from "efi/ethereum";
import { ElementLogo } from "efi-ui/base/ElementLogo";
import { SaveAppMenuButton } from "efi-ui/saveApp/navigation/SaveAppMenuButton/SaveAppMenuButton";

let earnAppUrl = "http://localhost:3000";
if (isGoerli(AddressesJson.chainId)) {
  earnAppUrl = "https://testnet.element.fi";
} else if (isMainnet(AddressesJson.chainId)) {
  earnAppUrl = "https://app.element.fi";
}

interface SaveAppHeaderProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
}
export function SaveAppHeader({
  account,
  chainId,
  walletConnectionActive,
}: SaveAppHeaderProps): ReactElement {
  const { isDarkMode, setDarkModeOff, setDarkModeOn } = useDarkMode();
  return (
    <div className={tw("flex", "w-full", "flex-col")}>
      <ExperimentalBanner className={tw("hidden", "lg:flex")} />

      {/* Mobile */}
      <div
        className={tw("flex", "lg:hidden", "w-full", "p-2", "justify-between")}
      >
        <SaveAppMenuButton />
        <AnchorButton
          href={earnAppUrl}
          large
          outlined
          intent={Intent.PRIMARY}
          icon={IconNames.SHARE}
        >{t`Advanced UI`}</AnchorButton>
      </div>
      <ExperimentalBanner className={tw("flex", "lg:hidden", "text-xs")} />

      {/* Desktop */}
      <div
        className={tw(
          "hidden",
          "lg:flex",
          "w-full",
          "space-x-4",
          "p-4",
          "items-end",
          "justify-between"
        )}
      >
        <ElementLogo
          height={48}
          isDarkMode={isDarkMode}
          className={tw("mr-16", "hidden", "md:block")}
        />
        <div className={tw("flex", "space-x-4", "items-center")}>
          <div className={tw("flex", "flex-shrink-0")}>
            <AnchorButton
              href={earnAppUrl}
              large
              outlined
              intent={Intent.PRIMARY}
              icon={IconNames.SHARE}
            >{t`Advanced UI`}</AnchorButton>
          </div>
          <Button
            minimal
            className={tw("px-6")}
            icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
            onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
          />
          <ConnectWalletButton
            account={account}
            chainId={chainId}
            walletConnectionActive={walletConnectionActive}
          />
          <SaveHamburgerButton />
        </div>
      </div>
    </div>
  );
}
