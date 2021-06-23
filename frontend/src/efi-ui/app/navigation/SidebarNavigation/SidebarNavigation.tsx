import { ReactElement, useState } from "react";

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
import { Link } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo-vertical--dark.svg";
import logo from "efi-static-assets/logos/svg/logo-vertical--light.svg";
import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";

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
  const { transactionHash } = usePendingTransactionPref();
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
      <Link
        className={tw("flex", "justify-center", "pt-4", "pb-8", "px-6")}
        to={t`/${Navigation.EARN}`}
      >
        <img src={isDarkMode ? logoDark : logo} alt={t`Element Finance`} />
      </Link>
      <div
        className={tw("flex", "flex-col", "h-full", "justify-between", "pt-16")}
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
            id={Navigation.TRADE}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.SHOP} iconSize={IconSize.STANDARD} />
                <span>{t`Trade`}</span>
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
        </Tabs>
      </div>
    </div>
  );
}
