import { Classes } from "@blueprintjs/core";
import { LocationProvider, Router } from "@reach/router";
import classNames from "classnames";
import React, { FC } from "react";
import { ReactQueryDevtools } from "react-query-devtools";
import { tw } from "tailwindcss-classnames";

import { HomeView } from "efi/ui/home/HomeView";
import { InvestView } from "efi/ui/invest/InvestView";
import { MainNavigation } from "efi/ui/navigation/MainNavigation/MainNavigation";
import { Navigation } from "efi/ui/navigation/navigation";
import { PortfolioView } from "efi/ui/portfolio/PortfolioView";
import { SwapView } from "efi/ui/swaps/SwapView/SwapView";
import { useSyncWithInjectedEthereum } from "efi/ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./App.module.css";

const appClassName = classNames(
  styles.app,
  Classes.DARK,
  tw("flex", "flex-col", "lg:flex-row", "w-full", "h-full", "overflow-auto")
);

const contentClassName = tw(
  "flex-1",
  "w-full",
  "h-auto",
  "lg:h-full",
  "lg:w-auto",
  "pt-12",
  "lg:pt-0"
);

interface AppProps {}

const App: FC<AppProps> = () => {
  // Do this at the top in one place so we don't have multiple callers trying to
  // set event handlers. TODO: clean this up further so it can live in useWallet
  useSyncWithInjectedEthereum();

  return (
    <>
      <div className={appClassName}>
        <LocationProvider>
          <MainNavigation />
        </LocationProvider>

        <Router className={contentClassName}>
          <HomeView path="/" />
          <PortfolioView path={Navigation.PORTFOLIO} />
          <SwapView path={Navigation.SWAP} />
          <InvestView path={Navigation.INVEST} />
        </Router>
      </div>

      {/* Safe to render unconditionally as it does not render in production
      builds by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
};

export default App;
