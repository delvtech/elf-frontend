import {
  Alignment,
  AnchorButton,
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import classNames from "classnames";
import React, { FC } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";
import { PrefsMenuButton } from "efi-ui/prefs/PrefsMenuButton/PrefsMenuButton";
import WalletSummary from "efi-ui/wallets/WalletSummary/WalletSummary";

import styles from "./TopbarNavigation.module.css";

interface TopbarNavigationProps {
  deactivate: () => void;
  isDarkMode: boolean;
  onDarkModeChange: (event: any) => void;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
export const TopbarNavigation: FC<TopbarNavigationProps> = ({
  activeTab,
  changeTab,
}) => {
  return (
    <div
      className={tw(
        "lg:hidden",
        "flex",
        "flex-col",
        "flex-shrink-0",
        "h-24",
        "justify-end"
      )}
    >
      <Navbar fixedToTop className={tw("flex")}>
        <NavbarGroup>
          <NavbarHeading>
            <AnchorButton minimal outlined>
              <strong>Element.fi</strong>
            </AnchorButton>
          </NavbarHeading>
        </NavbarGroup>

        <NavbarGroup className={tw("flex-1", "justify-center")}>
          <Popover minimal content={<WalletSummary />}>
            <Button minimal outlined text="Wallet" />
          </Popover>
        </NavbarGroup>

        <NavbarGroup align={Alignment.RIGHT}>
          <PrefsMenuButton />
        </NavbarGroup>
      </Navbar>

      <div className={tw("lg:hidden", "flex", "w-full", "px-4", "justify-end")}>
        <Tabs
          id="primary-nav-mobile"
          className={classNames(styles.smTabs)}
          selectedTabId={activeTab}
          onChange={changeTab}
        >
          <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
          <Tab id={Navigation.POOLS} title={t`Pools`} />
          <Tab id={Navigation.EXCHANGE} title={t`Exchange`} />
          <Tab id={Navigation.FAQ} title={t`Resources`} />
        </Tabs>
      </div>
    </div>
  );
};
