import React, { ReactElement, useState } from "react";

import {
  Classes,
  Icon,
  IconSize,
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
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";

import { ConnectWalletButton } from "./ConnectWalletButton";
import styles from "./SidebarNavigation.module.css";

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
  "space-x-2",
  "items-center",
  "w-full",
  "px-2",
  "py-4"
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
      <div className={tw("flex", "justify-center", "pt-4", "pb-8", "px-6")}>
        <img src={isDarkMode ? logoDark : logo} alt={t`Element Finance`} />
      </div>
      <div
        className={tw("flex", "flex-col", "h-full", "justify-between", "pb-8")}
      >
        <Tabs
          id="primary-nav-desktop"
          vertical
          onChange={changeTab}
          selectedTabId={activeTab}
          className={tw("w-full", "flex-col")}
        >
          <Tab
            id={Navigation.EARN}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.DOLLAR} iconSize={IconSize.STANDARD} />
                <span>{t`Earn`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.MINT}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.CUBE_ADD} iconSize={IconSize.STANDARD} />
                <span>{t`Deposit`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.PORTFOLIO}
            title={
              <div className={tabTitleClassName}>
                <Icon
                  icon={IconNames.TIMELINE_AREA_CHART}
                  iconSize={IconSize.STANDARD}
                />
                <span
                  className={tw("flex", "w-full", "justify-between")}
                >{t`Portfolio`}</span>
                {hasPendingTransaction ? (
                  <Spinner size={SpinnerSize.SMALL} />
                ) : null}
              </div>
            }
          />
          <Tab
            id={Navigation.PRINCIPAL_POOLS}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.SHOP} iconSize={IconSize.STANDARD} />
                <span>{t`Principal`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.YIELD_POOLS}
            title={
              <div className={tabTitleClassName}>
                <Icon
                  icon={IconNames.PERCENTAGE}
                  iconSize={IconSize.STANDARD}
                />
                <span>{t`Yield`}</span>
              </div>
            }
          />
          <Tab
            id={Navigation.RESOURCES}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.MANUAL} iconSize={IconSize.STANDARD} />
                <span>{t`Resources`}</span>
              </div>
            }
          />
        </Tabs>
        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "space-y-4"
          )}
        >
          <div className={tw("flex", "w-full", "justify-center", "space-y-2")}>
            <ConnectWalletButton
              isDialogOpen={isWalletDialogOpen}
              onDialogOpen={() => setWalletDialogOpen(true)}
              onDialogClose={() => setWalletDialogOpen(false)}
              account={account}
              active={active}
              chainId={chainId}
            />
          </div>

          <DarkModeSwitch />
        </div>
      </div>
    </div>
  );
}
