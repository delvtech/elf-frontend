import React, { FC } from "react";

import {
  Alignment,
  AnchorButton,
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Popover,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi/ui/navigation/navigation";
import WalletSummary from "efi/ui/wallets/WalletSummary/WalletSummary";

import styles from "./TopbarNavigation.module.css";

interface TopbarNavigationProps {
  deactivate: () => void;
  isDarkMode: boolean;
  onDarkModeChange: (event: any) => void;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
export const TopbarNavigation: FC<TopbarNavigationProps> = ({
  deactivate,
  /* defaults to false to keep Blueprint.Switch in controlled mode */
  isDarkMode = false,
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
          <Switch
            className={tw("m-0")}
            checked={isDarkMode}
            onChange={onDarkModeChange}
            innerLabel={t`Light mode`}
            innerLabelChecked={t`Dark mode`}
          />
          <Button minimal icon={IconNames.LOG_OUT} onClick={deactivate} />
        </NavbarGroup>
      </Navbar>

      <div className={tw("lg:hidden", "flex", "w-full", "px-4", "justify-end")}>
        <Tabs
          id="primary-nav-mobile"
          className={classNames(styles.smTabs)}
          selectedTabId={activeTab}
          onChange={changeTab}
        >
          {/* <Tab id={Navigation.HOME} title={t`Home`} /> */}
          <Tab id={Navigation.PULSE} title={t`Pulse`} />
          <Tab id={Navigation.INVEST} title={t`Invest`} />
          <Tab id={Navigation.SWAP} title={t`Swap`} />
          <Tab id={Navigation.FAQ} title={t`FAQ`} />
        </Tabs>
      </div>
    </div>
  );
};
