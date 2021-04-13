import { FC, useState } from "react";

import {
  Button,
  Colors,
  Icon,
  Intent,
  Navbar,
  NavbarGroup,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { Navigation } from "efi-ui/navigation/navigation";
import { DarkModeSwitch } from "efi-ui/prefs/DarkModeSwitch/DarkModeSwitch";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { isMainnet } from "efi/crypto/ethereum";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import styles from "./TopbarNavigation.module.css";

interface TopbarNavigationProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  deactivate: () => void;
  isDarkMode: boolean;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
export const TopbarNavigation: FC<TopbarNavigationProps> = ({
  activeTab,
  changeTab,
  account,
  active,
  chainId,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const mainnetDanger =
    !!chainId && isMainnet(chainId) && process.env.NODE_ENV !== "production";

  let walletButtonIntent: Intent = Intent.NONE;
  if (!account) {
    walletButtonIntent = Intent.WARNING;
  } else if (mainnetDanger) {
    walletButtonIntent = Intent.DANGER;
  }
  const connectionStatusColor = active ? Colors.GREEN4 : Colors.RED4;
  return (
    <div className={tw("lg:hidden", "h-16", "flex", "flex-shrink-0")}>
      <Navbar fixedToTop className={tw("flex", "justify-between")}>
        <NavbarGroup>
          <img
            className={tw("h-8")}
            src={isDarkMode ? logoDark : logo}
            alt={t`Element Finance`}
          />
        </NavbarGroup>
        <NavbarGroup>
          <Tabs
            id="primary-nav-mobile"
            className={classNames(styles.smTabs)}
            selectedTabId={activeTab}
            onChange={changeTab}
          >
            <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
            <Tab id={Navigation.EARN} title={t`Earn`} />
            <Tab id={Navigation.EXCHANGE} title={t`Exchange`} />
            <Tab id={Navigation.MINT} title={t`Mint`} />
            <Tab id={Navigation.FAQ} title={t`Resources`} />
          </Tabs>
        </NavbarGroup>
        <NavbarGroup>
          <Button
            minimal={!mainnetDanger}
            icon={
              !account ? (
                <Icon
                  icon={IconNames.SEND_TO_GRAPH}
                  iconSize={Icon.SIZE_LARGE}
                />
              ) : (
                <WalletJazzicon size={28} account={account} />
              )
            }
            fill
            intent={walletButtonIntent}
            onClick={() => setWalletDialogOpen(true)}
          >
            <div className={tw("flex", "space-x-4", "items-center")}>
              {!account ? (
                <span className={tw("text-center")}>
                  {t`Connect wallet to begin`}
                </span>
              ) : (
                <LabeledText
                  className={tw("text-center")}
                  text={
                    <span>
                      <Icon
                        className={tw("pr-2")}
                        icon={IconNames.DOT}
                        color={connectionStatusColor}
                      />
                      {formatWalletAddress(account)}
                    </span>
                  }
                  label={formatChainName(active, chainId)}
                />
              )}
            </div>
            <ConnectWalletDialog
              isOpen={isWalletDialogOpen}
              onClose={() => setWalletDialogOpen(false)}
            />
          </Button>
        </NavbarGroup>
        <NavbarGroup>
          <DarkModeSwitch />
        </NavbarGroup>
      </Navbar>
    </div>
  );
};
