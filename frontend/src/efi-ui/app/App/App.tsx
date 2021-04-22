import React, { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { LocationProvider, Redirect, Router } from "@reach/router";
import classNames from "classnames";

import { tw } from "efi-tailwindcss-classnames";
import { ExchangeView } from "efi-ui/exchange/ExchangeView/ExchangeView";
import { FAQView } from "efi-ui/faq/FAQView";
import { EarnView } from "efi-ui/earn/EarnView/EarnView";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { MintView } from "efi-ui/mint/MintView/MintView";
import { MainNavigation } from "efi-ui/navigation/MainNavigation/MainNavigation";
import { Navigation } from "efi-ui/navigation/navigation";
import { PortfolioView } from "efi-ui/portfolio/PortfolioView/PortfolioView";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./App.module.css";

const contentClassName = tw(
  "flex-1",
  "w-full",
  "h-full",
  "lg:h-full",
  "lg:w-auto",
  "lg:pt-0"
);

interface AppProps {}

const App: FC<AppProps> = () => {
  const { isDarkMode, darkModeClassName } = useDarkMode();

  const appClassName = classNames(
    styles.appBackground,
    { [styles.appBackgroundDark]: isDarkMode },
    darkModeClassName,
    tw("flex", "flex-col", "lg:flex-row", "w-full", "h-full")
  );

  // Do this at the top in one place so we don't have multiple callers trying to
  // set event handlers. TODO: clean this up so that it's more of a portable
  // singleton and can live in useWallet and be called multiple times safely
  useSyncWithInjectedEthereum();

  return (
    <Fragment>
      <div className={appClassName}>
        <LocationProvider>
          <MainNavigation />
        </LocationProvider>

        <Router className={contentClassName}>
          <Redirect noThrow from="/" to={Navigation.EARN} />

          <PortfolioView path={Navigation.PORTFOLIO} />
          <EarnView path={Navigation.EARN} />
          <ExchangeView path={Navigation.EXCHANGE} />
          <PoolView path={`${Navigation.EXCHANGE}/:poolAddress`} />
          <MintView path={Navigation.MINT} />
          <FAQView path={Navigation.RESOURCES} />
        </Router>
      </div>

      {/* Safe to render unconditionally as it does not render in production
      builds by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
};

export default App;
