import { ReactElement } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { ExperimentalBanner } from "efi-ui/page/ExperimentalBanner/ExperimentalBanner";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SaveHamburgerButton } from "efi-ui/saveApp/navigation/SaveNavigation/SaveHamburgerButton";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import { AddressesJson } from "efi/addresses";
import { isGoerli, isMainnet } from "efi/ethereum";

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
    <div className={tw("flex", "flex-col", "w-full")}>
      <ExperimentalBanner />
      {/* page title */}
      <div
        className={tw("flex", "p-8", "w-full", "justify-between", "items-end")}
      >
        <img
          style={{
            height: 48, // don't use tailwind here since we want fixed height and rem is dynamic
          }}
          src={isDarkMode ? logoDark : logo}
          alt={t`Element Finance`}
        />
        <div className={tw("flex", "space-x-4", "items-center")}>
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
          <div className={tw("flex", "flex-shrink-0")}>
            <AnchorButton
              href={earnAppUrl}
              large
              outlined
              intent={Intent.PRIMARY}
              icon={IconNames.SHARE}
            >{t`Advanced UI`}</AnchorButton>
          </div>
          <SaveHamburgerButton />
        </div>
      </div>
    </div>
  );
}
