import React, { FC } from "react";

import { Classes, Icon, Tab, Tabs } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import { ReactComponent as ElementLogoMarkDark } from "efi-static-assets/logos/svg/logo-vertical--dark.svg";
import { ReactComponent as ElementLogoMark } from "efi-static-assets/logos/svg/logo-vertical--light.svg";
import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";

import styles from "./SidebarNavigation.module.css";

interface SidebarNavigationProps {
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
        tw("hidden", "w-48", "lg:flex", "flex-col", "h-full")
      )}
    >
      <div className={tw("flex", "justify-center", "pt-8", "pb-16", "px-6")}>
        {isDarkMode ? (
          <ElementLogoMarkDark width={128} />
        ) : (
          <ElementLogoMark width={128} />
        )}
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
