import React, { FC, useState } from "react";

import {
  Button,
  Classes,
  Colors,
  Icon,
  Intent,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo-vertical--dark.svg";
import logo from "efi-static-assets/logos/svg/logo-vertical--light.svg";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { isMainnet } from "efi/crypto/ethereum";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import styles from "./SidebarNavigation.module.css";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";

interface SidebarNavigationProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  isDarkMode: boolean;
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
}

const tabTitleClassName = tw(
  "flex",
  "space-x-6",
  "items-center",
  "px-6",
  "py-8"
);
export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  account,
  active,
  chainId,
  isDarkMode,
  changeTab,
  activeTab,
}) => {
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
    <div
      className={classNames(
        Classes.ELEVATION_2,
        styles.sideBar,
        { [styles.sideBarDark]: isDarkMode },
        tw("hidden", "w-48", "lg:flex", "flex-col", "h-full")
      )}
    >
      <div className={tw("flex", "justify-center", "pt-8", "pb-16", "px-6")}>
        <img src={isDarkMode ? logoDark : logo} alt={t`Element Finance`} />
      </div>
      <div
        className={tw("flex", "flex-col", "h-full", "justify-between", "pb-8")}
      >
        <Tabs
          id="primary-nav-desktop"
          large
          vertical
          className={classNames(styles.tabs)}
          onChange={changeTab}
          selectedTabId={activeTab}
        >
          <Tab
            id={Navigation.PORTFOLIO}
            title={
              <div className={tabTitleClassName}>
                <Icon
                  icon={IconNames.TIMELINE_AREA_CHART}
                  iconSize={Icon.SIZE_LARGE}
                />
                <span>{t`Portfolio`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.INVEST}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.PERCENTAGE} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Invest`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.EXCHANGE}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.SHOP} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Exchange`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.MINT}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.CUBE_ADD} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Mint`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.FAQ}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.MANUAL} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Resources`}</span>
              </div>
            }
          />
        </Tabs>
        <div className={tw("flex", "w-full", "justify-center", "space-y-4")}>
          <Button
            minimal={!mainnetDanger}
            fill
            intent={walletButtonIntent}
            onClick={() => setWalletDialogOpen(true)}
          >
            <div
              className={tw(
                "flex",
                "flex-col",
                "space-y-4",
                "items-center",
                "px-6",
                "py-8"
              )}
            >
              {!account ? (
                <Icon
                  icon={IconNames.SEND_TO_GRAPH}
                  iconSize={Icon.SIZE_LARGE}
                />
              ) : (
                <WalletJazzicon size={42} account={account} />
              )}
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
        </div>

        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "space-y-4"
          )}
        >
          <PrefsMenuButton />
        </div>
      </div>
    </div>
  );
};
