import React, { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query-devtools";

import { LocationProvider, Router } from "@reach/router";
import classNames from "classnames";

import { tw } from "efi-tailwindcss-classnames";
import { CryptoDrawer } from "efi-ui/crypto/CryptoDrawer/CryptoDrawer";
import { FAQView } from "efi-ui/faq/FAQView";
import { HomeView } from "efi-ui/home/HomeView";
import { PoolsView } from "efi-ui/pools/PoolsView/PoolsView";
import { MainNavigation } from "efi-ui/navigation/MainNavigation/MainNavigation";
import { Navigation } from "efi-ui/navigation/navigation";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { PulseView } from "efi-ui/pulse/PulseView";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./App.module.css";
import { WalletView } from "efi-ui/wallets/WalletView/WalletView";

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
          <HomeView path="/" />
          <PulseView path={Navigation.PULSE} />
          <PoolsView path={Navigation.INVEST} />
          <FAQView path={Navigation.FAQ} />
          <WalletView path={Navigation.WALLET} />
        </Router>
      </div>
      <CryptoDrawer />

      {/* Safe to render unconditionally as it does not render in production
      builds by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
};

export default App;
