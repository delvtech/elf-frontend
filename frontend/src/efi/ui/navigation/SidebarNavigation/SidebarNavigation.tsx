import { Button, ButtonGroup, Switch, Tab, Tabs } from "@blueprintjs/core";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

import { Navigation } from "efi/ui/navigation/navigation";

import styles from "./SidebarNavigation.module.css";

interface SidebarNavigationProps {
  isDarkMode: boolean;
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
  account: string | null | undefined;
  deactivate: () => void;
  connectToInjectedWallet: () => Promise<void>;
  onDarkModeChange: (event: any) => void;
}
export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  isDarkMode,
  changeTab,
  activeTab,
  account,
  deactivate,
  connectToInjectedWallet,
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
          <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
          <Tab id={Navigation.INVEST} title={t`Invest`} />
          <Tab id={Navigation.SWAP} title={t`Swap`} />
        </Tabs>

        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-12",
            "w-full",
            "items-center"
          )}
        >
          <ButtonGroup large vertical minimal className={tw("w-full")}>
            <Button onClick={account ? deactivate : connectToInjectedWallet}>
              {account ? t`Disconnect wallet` : t`Connect your wallet`}
            </Button>
            <Button>{t`Resources`}</Button>
          </ButtonGroup>

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
