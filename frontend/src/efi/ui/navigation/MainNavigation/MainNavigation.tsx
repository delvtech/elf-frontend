import {
  Alignment,
  AnchorButton,
  Button,
  ButtonGroup,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Switch,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { FC, Fragment, useCallback } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

import { useDarkMode } from "efi/ui/base/useDarkMode/useDarkMode";
import { useNavigation } from "efi/ui/navigation/hooks/useTab";
import { Navigation } from "efi/ui/navigation/navigation";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { injectedConnector } from "efi/wallets/connectors";

import styles from "./MainNavigation.module.css";

interface MainNavigationProps {}
export const MainNavigation: FC<MainNavigationProps> = () => {
  const { account } = useWallet();
  const { activeTab, changeTab } = useNavigation();

  const { isDarkMode, setDarkMode } = useDarkMode();

  const onDarkModeChange = useCallback(
    (event) => setDarkMode((event.target as HTMLInputElement).checked),
    [setDarkMode]
  );

  const { deactivate, activate } = useWeb3React<Web3Provider>();
  const connectToInjectedWallet = useCallback(
    () => activate(injectedConnector),
    [activate]
  );

  return (
    <Fragment>
      {/* Mobile/Tablet */}
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
          <NavbarGroup align={Alignment.RIGHT}>
            <Button minimal icon={IconNames.LOG_OUT} onClick={deactivate} />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Switch
              className={tw("m-0")}
              checked={isDarkMode}
              onChange={onDarkModeChange}
              innerLabel={t`Light mode`}
              innerLabelChecked={t`Dark mode`}
            />
          </NavbarGroup>
        </Navbar>
        <div
          className={tw("lg:hidden", "flex", "w-full", "px-4", "justify-end")}
        >
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

      {/* Desktop */}
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
          className={tw(
            "flex",
            "flex-col",
            "h-full",
            "justify-between",
            "pb-8"
          )}
        >
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
            <Tab id={Navigation.INVEST} title={t`Invest`} />
            <Tab id={Navigation.SWAP} title={t`Swap`} />
          </Tabs>

          <div
            className={tw(
              "flex",
              "flex-col",
              "space-y-12",
              "w-full",
              "items-center"
            )}
          >
            <ButtonGroup large vertical minimal className={tw("w-full")}>
              <Button onClick={account ? deactivate : connectToInjectedWallet}>
                {account ? t`Disconnect wallet` : t`Connect your wallet`}
              </Button>
              <Button>{t`Resources`}</Button>
            </ButtonGroup>

            <Switch
              large
              checked={isDarkMode}
              onChange={onDarkModeChange}
              innerLabel={t`Light mode`}
              innerLabelChecked={t`Dark mode`}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};
