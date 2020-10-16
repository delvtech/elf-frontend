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
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { useTab } from "efi/ui/navigation/hooks/useTab";
import { Navigation } from "efi/ui/navigation/navigation";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { useWalletConnection } from "efi/ui/wallets/hooks/useWalletConnection";
import { injectedConnector } from "efi/wallets/connectors";
import React, { Fragment, useCallback } from "react";
import { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import styles from "./MainNavigation.module.css";

interface MainNavigationProps {}
export const MainNavigation: FC<MainNavigationProps> = () => {
  const { account } = useWallet();
  const { activeTab, changeTab } = useTab();

  const { disconnect, connect } = useWalletConnection();
  const connectToMetaMask = useCallback(() => connect(injectedConnector), [
    connect,
  ]);

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
          <Button
            minimal
            outlined
            icon={IconNames.LOG_OUT}
            onClick={disconnect}
          />
        </NavbarGroup>
        <NavbarGroup className={tw("sm:pr-2")} align={Alignment.RIGHT}>
          <Tabs
            id="primary-nav-mobile"
            className={classNames(styles.smTabs)}
            selectedTabId={activeTab}
            onChange={changeTab}
          >
            <Tab id={Navigation.HOME} title={t`Home`} />
            <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
            <Tab id={Navigation.SWAP} title={t`Swap`} />
            <Tab id={Navigation.INVEST} title={t`Invest`} />
          </Tabs>
        </NavbarGroup>
      </Navbar>

      {/* Desktop */}
      <div
        className={tw(
          "hidden",
          "lg:flex",
          "flex-col",
          "w-1/6",
          "h-full",
          "flex-shrink-0",
          "pt-10"
        )}
        style={{
          background: "var(--bp3-dark-navbar-bg-color)",
          color: "var(--bp3-dark-navbar-color)",
        }}
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
            onChange={changeTab}
            selectedTabId={activeTab}
          >
            <Tab id={Navigation.HOME} title={t`Home`} />
            <Tab id={Navigation.PORTFOLIO} title={t`Portfolio`} />
            <Tab id={Navigation.SWAP} title={t`Swap`} />
            <Tab id={Navigation.INVEST} title={t`Invest`} />
          </Tabs>

          <ButtonGroup large vertical minimal className={tw("pb-10")}>
            <Button onClick={account ? disconnect : connectToMetaMask}>
              {account ? t`Disconnect wallet` : t`Connect your wallet`}
            </Button>
            <Button>{t`Resources`}</Button>
          </ButtonGroup>
        </div>
      </div>
    </Fragment>
  );
};
