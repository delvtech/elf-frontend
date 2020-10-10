import {
  Alignment,
  AnchorButton,
  Button,
  ButtonGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import classNames from "classnames";
import { Navigation } from "efi/app/navigation";
import React, { Fragment } from "react";
import { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import styles from "./MainNavigation.module.css";

interface MainNavigationProps {
  activeTab: Navigation;
  setActiveTab: (newActiveTab: Navigation) => void;
}
export const MainNavigation: FC<MainNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <Fragment>
      {/* Mobile/Tablet */}
      <Navbar fixedToTop className={tw("lg:hidden")}>
        <NavbarGroup>
          <NavbarHeading>
            <AnchorButton minimal outlined>
              <strong>Element.fi</strong>
            </AnchorButton>
          </NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Tabs
            id="primary-nav-mobile"
            className={classNames(styles.smTabs)}
            selectedTabId={activeTab}
            onChange={setActiveTab}
          >
            <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
            <Tab id={Navigation.SWAP} title={t`Swap`} />
            <Tab id={Navigation.FUNDS} title={t`Funds`} />
          </Tabs>
        </NavbarGroup>
      </Navbar>

      {/* Desktop */}
      <div
        className={tw(
          "hidden",
          "lg:flex",
          "flex-row",
          "w-1/6",
          "h-full",
          "flex-col",
          "flex-shrink-0"
        )}
        style={{
          background: "var(--bp3-dark-navbar-bg-color)",
          color: "var(--bp3-dark-navbar-color)",
        }}
      >
        <span className={tw("py-10", "text-center", "text-xl", "font-bold")}>
          Element.fi
        </span>
        <div className={tw("flex", "flex-col", "h-full", "justify-between")}>
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
            selectedTabId={activeTab}
            onChange={setActiveTab}
          >
            <Tab
              id={Navigation.PORTFOLIO}
              title={t`Portfolio`}
              className={tw("my-2")}
            />
            <Tab id={Navigation.SWAP} title={t`Swap`} className={tw("my-2")} />
            <Tab
              id={Navigation.FUNDS}
              title={t`Funds`}
              className={tw("my-2")}
            />
          </Tabs>

          <ButtonGroup large vertical minimal className={tw("pb-10")}>
            <Button>{t`Connect your wallet`}</Button>
            <Button>{t`Resources`}</Button>
          </ButtonGroup>
        </div>
      </div>
    </Fragment>
  );
};
