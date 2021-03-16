import React, { FC } from "react";

import { Navbar, NavbarGroup, Tab, Tabs } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

import styles from "./TopbarNavigation.module.css";

interface TopbarNavigationProps {
  deactivate: () => void;
  isDarkMode: boolean;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
export const TopbarNavigation: FC<TopbarNavigationProps> = ({
  activeTab,
  changeTab,
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className={tw("lg:hidden", "h-16")}>
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
            <Tab id={Navigation.INVEST} title={t`Invest`} />
            <Tab id={Navigation.EXCHANGE} title={t`Exchange`} />
            <Tab id={Navigation.MINT} title={t`Mint`} />
            <Tab id={Navigation.FAQ} title={t`Resources`} />
          </Tabs>
        </NavbarGroup>
        <NavbarGroup>
          <PrefsMenuButton />
        </NavbarGroup>
      </Navbar>
    </div>
  );
};
