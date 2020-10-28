import {
  Alignment,
  AnchorButton,
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

import { Navigation } from "efi/ui/navigation/navigation";

import styles from "./TopbarNavigation.module.css";
import WalletSummary from "efi/ui/wallets/WalletSummary/WalletSummary";

interface TopbarNavigationProps {
  deactivate: () => void;
  isDarkMode: boolean;
  onDarkModeChange: (event: any) => void;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
export const TopbarNavigation: FC<TopbarNavigationProps> = ({
  deactivate,
  isDarkMode,
  onDarkModeChange,
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
      <Navbar fixedToTop>
        <NavbarGroup>
          <NavbarHeading>
            <AnchorButton minimal outlined>
              <strong>Element.fi</strong>
            </AnchorButton>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.CENTER}>
          <WalletSummary />
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button minimal icon={IconNames.LOG_OUT} onClick={deactivate} />
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          {" "}
          <Switch
            className={tw("m-0")}
            checked={isDarkMode}
            onChange={onDarkModeChange}
            innerLabel={t`Light mode`}
            innerLabelChecked={t`Dark mode`}
          />
        </NavbarGroup>
      </Navbar>
      <div className={tw("lg:hidden", "flex", "w-full", "px-4", "justify-end")}>
        <Tabs
          id="primary-nav-mobile"
          className={classNames(styles.smTabs)}
          selectedTabId={activeTab}
          onChange={changeTab}
        >
          <Tab id={Navigation.HOME} title={t`Home`} />
          <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
          <Tab id={Navigation.INVEST} title={t`Invest`} />
          <Tab id={Navigation.SWAP} title={t`Swap`} />
        </Tabs>
      </div>
    </div>
  );
};
