import React, { FC } from "react";

import { Switch, Tab, Tabs } from "@blueprintjs/core";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import { t } from "ttag";

import { Navigation } from "efi/ui/navigation/navigation";
import WalletSummary from "efi/ui/wallets/WalletSummary/WalletSummary";

import styles from "./SidebarNavigation.module.css";

interface SidebarNavigationProps {
  isDarkMode: boolean;
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
  onDarkModeChange: (event: any) => void;
}
export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  isDarkMode,
  changeTab,
  activeTab,
  onDarkModeChange,
}) => {
  return (
    <div
      className={classNames(
        styles.sideBar,
        { [styles.sideBarDark]: isDarkMode },
        tw(
          "hidden",
          "lg:flex",
          "flex-col",
          "w-1/4",
          "h-full",
          "flex-shrink-0",
          "pt-10"
        )
      )}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "justify-center",
          "gap-4",
          "items-center",
          "mb-12"
        )}
      >
        <span role="img" className={tw("text-3xl")} aria-label="Element.fi">
          ✨
        </span>
        <span className={tw("text-center", "text-xl", "font-bold")}>
          Element.fi
        </span>
      </div>
      <div
        className={tw("flex", "flex-col", "h-full", "justify-between", "pb-8")}
      >
        <div className={tw("space-y-12")}>
          <WalletSummary />
          <Tabs
            id="primary-nav-desktop"
            animate={
              // Turned off because it transitions poorly when screen
              // size is adjusted via dragging the window
              false
            }
            large
            vertical
            className={classNames(tw("w-full"), styles.tabs)}
            onChange={changeTab}
            selectedTabId={activeTab}
          >
            <Tab id={Navigation.HOME} title={t`Home`} />
            <Tab id={Navigation.PULSE} title={t`Pulse`} />
            <Tab id={Navigation.INVEST} title={t`Invest`} />
          </Tabs>
        </div>

        <div className={tw("flex", "flex-col", "w-full", "items-center")}>
          <Switch
            large
            checked={isDarkMode}
            onChange={onDarkModeChange}
            innerLabel={t`Light mode`}
            innerLabelChecked={t`Dark mode`}
          />
        </div>
      </div>
    </div>
  );
};
