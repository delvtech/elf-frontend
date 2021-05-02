import React, { ReactElement, useState } from "react";

import {
  Classes,
  Icon,
  Spinner,
  SpinnerSize,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo-vertical--dark.svg";
import logo from "efi-static-assets/logos/svg/logo-vertical--light.svg";
import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { DarkModeSwitch } from "efi-ui/prefs/DarkModeSwitch/DarkModeSwitch";

import { ConnectWalletButton } from "./ConnectWalletButton";
import styles from "./SidebarNavigation.module.css";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";

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

export function SidebarNavigation({
  account,
  active,
  chainId,
  isDarkMode,
  changeTab,
  activeTab,
}: SidebarNavigationProps): ReactElement {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const { transactionHash } = usePendingTransaction();
  const hasPendingTransaction = !!transactionHash;

  return (
    <div
      className={classNames(
        Classes.ELEVATION_2,
        styles.sideBar,
        { [styles.sideBarDark]: isDarkMode },
        tw(
          "hidden",
          "w-48",
          "lg:flex",
          "flex-col",
          "h-full",
          "overflow-hidden",
          "overflow-y-scroll",
          "flex-shrink-0"
        )
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
          onChange={changeTab}
          selectedTabId={activeTab}
        >
          <Tab
            id={Navigation.EARN}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.DOLLAR} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Earn`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.MINT}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.CUBE_ADD} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Deposit`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.PORTFOLIO}
            title={
              <div className={tabTitleClassName}>
                <Icon
                  icon={
                    hasPendingTransaction ? (
                      <Spinner size={SpinnerSize.SMALL} />
                    ) : (
                      IconNames.TIMELINE_AREA_CHART
                    )
                  }
                  iconSize={Icon.SIZE_LARGE}
                />
                <span>{t`Portfolio`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.PRINCIPAL_POOLS}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.SHOP} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Principal`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.YIELD_POOLS}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.PERCENTAGE} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Yield`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.RESOURCES}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.MANUAL} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Resources`}</span>
              </div>
            }
          />
        </Tabs>
        <div className={tw("flex", "w-full", "justify-center", "space-y-4")}>
          <ConnectWalletButton
            isDialogOpen={isWalletDialogOpen}
            onDialogOpen={() => setWalletDialogOpen(true)}
            onDialogClose={() => setWalletDialogOpen(false)}
            account={account}
            active={active}
            chainId={chainId}
          />
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
          <DarkModeSwitch />
        </div>
      </div>
    </div>
  );
}
