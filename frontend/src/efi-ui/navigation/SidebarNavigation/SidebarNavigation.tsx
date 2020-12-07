import React, { FC } from "react";

import { Classes, Icon, Tab, Tabs } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";

import styles from "./SidebarNavigation.module.css";

interface SidebarNavigationProps {
  isDarkMode: boolean;
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
  onDarkModeChange: (event: any) => void;
}

const tabTitleClassName = tw("flex", "flex-col", "items-center", "p-8");
export const SidebarNavigation: FC<SidebarNavigationProps> = ({
  isDarkMode,
  changeTab,
  activeTab,
}) => {
  return (
    <div
      className={classNames(
        Classes.ELEVATION_2,
        styles.sideBar,
        { [styles.sideBarDark]: isDarkMode },
        tw("hidden", "w-32", "lg:flex", "flex-col", "h-full", "pt-10")
      )}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "justify-center",
          "space-y-4",
          "items-center",
          "mb-20"
        )}
      >
        <div className={tw("flex", "flex-col", "pt-2", "space-y-1")}>
          <span className={tw("text-center", "text-lg")}>Element</span>
          <span className={tw("text-center", "text-lg")}>Finance</span>
        </div>
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
            id={Navigation.INVEST}
            title={
              <div className={tabTitleClassName}>
                <Icon icon={IconNames.CUBE_ADD} iconSize={Icon.SIZE_LARGE} />
                <span>{t`Invest`}</span>
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
