import React, { FC } from "react";

import {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import { ReactComponent as ElementLogoMarkDark } from "efi-static-assets/logos/svg/logo--dark.svg";
import { ReactComponent as ElementLogoMark } from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";

import styles from "./TopbarNavigation.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

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
      <Navbar fixedToTop>
        <NavbarGroup>
          <NavbarHeading>
            {isDarkMode ? (
              <ElementLogoMarkDark height={32} />
            ) : (
              <ElementLogoMark height={32} />
            )}
          </NavbarHeading>
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
        <NavbarGroup align={Alignment.RIGHT}>
          <PrefsMenuButton />
        </NavbarGroup>
      </Navbar>
    </div>
  );
};
