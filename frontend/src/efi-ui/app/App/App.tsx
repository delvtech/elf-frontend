import React, { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { FocusStyleManager, H1, Overlay } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { LocationProvider, Redirect, Router } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";

import { tw } from "efi-tailwindcss-classnames";
import { EarnView } from "efi-ui/earn/EarnView/EarnView";
import { FAQView } from "efi-ui/faq/FAQView";
import { MintView } from "efi-ui/mint/MintView/MintView";
import { MainNavigation } from "efi-ui/navigation/MainNavigation/MainNavigation";
import { Navigation } from "efi-ui/navigation/navigation";
import { PoolsView } from "efi-ui/pools/PoolsView/PoolsView";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { PortfolioView } from "efi-ui/portfolio/PortfolioView/PortfolioView";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useClearPendingTransactionOnMined } from "efi-ui/transactions/usePendingTransaction/useClearPendingTransaction";
import { useTransactionToasts } from "efi-ui/transactions/useTransactionToasts";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./App.module.css";
import { useEagerConnect } from "efi-ui/wallets/hooks/useEagerReconnect";

FocusStyleManager.onlyShowFocusOnTabs();

const contentClassName = tw(
  "flex-1",
  "w-full",
  "h-full",
  "lg:h-full",
  "lg:w-auto",
  "lg:pt-0",
  "overflow-hidden"
);

interface AppProps {}

const App: FC<AppProps> = () => {
  const { active, chainId } = useWeb3React<Web3Provider>();
  const onMainnet = active && chainId === 1;

  const { isDarkMode, darkModeClassName } = useDarkMode();

  const appClassName = classNames(
    styles.appBackground,
    { [styles.appBackgroundDark]: isDarkMode },
    darkModeClassName,
    tw("flex", "flex-col", "lg:flex-row", "w-full", "h-full")
  );

  // Do these at the top of the app in one place so we don't have multiple
  // callers trying to set event handlers.
  useSyncWithInjectedEthereum();
  useEagerConnect();
  useClearPendingTransactionOnMined();
  useTransactionToasts();

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
          <PoolsView path={Navigation.PRINCIPAL_POOLS} />
          <PoolsView path={Navigation.YIELD_POOLS} />
          <MintView path={Navigation.DEPOSIT} />
          <PoolView path={`pools/:poolAddress`} />
          <FAQView path={Navigation.RESOURCES} />
        </Router>
      </div>
      <Overlay isOpen={onMainnet}>
        <div
          className={tw(
            "flex",
            "justify-center",
            "items-center",
            "w-full",
            "h-full"
          )}
        >
          <H1 className={styles.overlay}>Please Connect to Goerli Testnet</H1>
        </div>
      </Overlay>
      <div className={styles.mobileView}>
        <Overlay isOpen={true} className={styles.mobileView}>
          <div
            className={tw(
              "flex",
              "justify-center",
              "items-center",
              "w-full",
              "h-full"
            )}
          >
            <div>
              <H1 className={styles.overlay}>
                Mobile Compatibility Coming with Mainnet Launch
              </H1>
            </div>
          </div>
        </Overlay>
      </div>
      {/* Safe to render unconditionally as it does not render in production
      builds by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
};

export default App;
