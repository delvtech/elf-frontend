import React, { FC } from "react";

import { Icon, Tab, Tabs } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi/ui/navigation/navigation";
import { PrefsMenuButton } from "efi/ui/prefs/PrefsMenuButton/PrefsMenuButton";
import WalletSummary from "efi/ui/wallets/WalletSummary/WalletSummary";

import styles from "./SidebarNavigation.module.css";

interface SidebarNavigationProps {
  isDarkMode: boolean;
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
  onDarkModeChange: (event: any) => void;
}

const tabTitleClassName = tw("flex", "space-x-6", "items-center", "p-3");
export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  isDarkMode,
  changeTab,
  activeTab,
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
            {/* <Tab
              id={Navigation.HOME}
              title={
                <div className={tabTitleClassName}>
                  <Icon icon={IconNames.HOME} iconSize={Icon.SIZE_LARGE} />
                  <span>{t`Home`}</span>
                </div>
              }
            /> */}
            <Tab
              id={Navigation.PULSE}
              title={
                <div className={tabTitleClassName}>
                  <Icon icon={IconNames.PULSE} iconSize={Icon.SIZE_LARGE} />
                  <span>{t`Pulse`}</span>
                </div>
              }
            />
            <Tab
              id={Navigation.INVEST}
              title={
                <div className={tabTitleClassName}>
                  <Icon icon={IconNames.CUBE_ADD} iconSize={Icon.SIZE_LARGE} />
                  <span>{t`Invest`}</span>
                </div>
              }
            />
            <Tab
              id={Navigation.SWAP}
              title={
                <div className={tabTitleClassName}>
                  <Icon icon={IconNames.EXCHANGE} iconSize={Icon.SIZE_LARGE} />
                  <span>{t`Swap`}</span>
                </div>
              }
            />
            <Tab
              id={Navigation.FAQ}
              title={
                <div className={tabTitleClassName}>
                  <Icon icon={IconNames.HELP} iconSize={Icon.SIZE_LARGE} />
                  <span>{t`FAQ`}</span>
                </div>
              }
            />
          </Tabs>
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
