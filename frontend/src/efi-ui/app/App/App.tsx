import React, { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { Button, FocusStyleManager, H1, Overlay } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { LocationProvider, Redirect, Router } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import { tw } from "efi-tailwindcss-classnames";
import { AppHamburgerButton } from "efi-ui/app/AppHamburgerButton/AppHamburgerButton";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { AppHeader } from "efi-ui/app/AppHeader/AppHeader";
import { TradeView } from "efi-ui/app/trade/TradeView/TradeView";
import { EarnView } from "efi-ui/earn/EarnView/EarnView";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { PortfolioView } from "efi-ui/portfolio/PortfolioView/PortfolioView";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useToastWrongChain } from "efi-ui/provider/useBlockFromTag/useToastWrongChain";
import { StatsView } from "efi-ui/stats/StatsView";
import { useTransactionToasts } from "efi-ui/transactions/useTransactionToasts";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import { useEagerConnect } from "efi-ui/wallets/hooks/useEagerReconnect";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";
import { AddressesJson } from "efi/addresses";
import { ChainId, ChainNames } from "efi/ethereum";
import { getConnectorName } from "efi/wallets/connectors";

import styles from "./App.module.css";
import { FixedRatesView } from "efi-ui/fixedrates/FixedRatesView";
import { BuyFixedRatesView } from "efi-ui/fixedrates/BuyFixedRatesView/BuyFixedRatesView";

FocusStyleManager.onlyShowFocusOnTabs();

interface AppProps {}

const App: FC<AppProps> = () => {
  const { active, account, chainId, deactivate, connector, library } =
    useWeb3React<Web3Provider>();
  const isWrongChain = active && chainId !== AddressesJson.chainId;
  const chainName = ChainNames[AddressesJson.chainId as ChainId];

  const { isDarkMode, darkModeClassName, setDarkModeOff, setDarkModeOn } =
    useDarkMode();

  // Do these at the top of the app in one place so we don't have multiple
  // callers trying to set event handlers.
  useSyncWithInjectedEthereum();
  useEagerConnect();
  useToastWrongChain(chainId);
  useTransactionToasts();

  return (
    <Fragment>
      <div
        className={classNames(
          styles.appBackground,
          { [styles.appBackgroundDark]: isDarkMode },
          darkModeClassName,
          tw("w-full", "h-full", "overflow-scroll")
        )}
      >
        <LocationProvider>
          <AppHeader
            account={account}
            active={active}
            chainId={chainId}
            connectorName={getConnectorName(connector, library)}
            deactivate={deactivate}
            hamburgerButton={<AppHamburgerButton />}
          />
        </LocationProvider>

        {/* need to use primary={false} to prevent scrolling issues.  more can be read here:
          https://stackoverflow.com/questions/53058110/stop-reach-router-scrolling-down-the-page-after-navigating-to-new-page
          */}
        <Router primary={false} className={tw("w-full", "h-full")}>
          <Redirect noThrow from="/" to={Navigation.EARN} />

          <FixedRatesView path={Navigation.FIXED_RATES} />
          <BuyFixedRatesView
            path={`${Navigation.FIXED_RATES}/:principalTokenAddress`}
          />
          <PortfolioView path={Navigation.PORTFOLIO} />
          <EarnView path={Navigation.EARN} />
          <TradeView path={Navigation.TRADE} />
          <PoolView path={`pools/:poolAddress`} />
          <StatsView path={Navigation.STATS} />
        </Router>
      </div>

      <div
        className={classNames(
          styles.appBackground,
          darkModeClassName,
          tw(
            "fixed",
            "w-full",
            "bottom-0",
            "flex",
            "px-8",
            "py-4",
            "justify-between",
            "block",
            "z-10",
            "lg:hidden"
          ),
          { [styles.appBackgroundDark]: isDarkMode }
        )}
      >
        <Button
          minimal
          className={tw("px-6", "py-3")}
          icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
          onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
        />
        <ConnectWalletButton
          account={account}
          chainId={chainId}
          walletConnectionActive={active}
        />
      </div>
      <Overlay isOpen={isWrongChain}>
        <div
          className={tw(
            "flex",
            "justify-center",
            "items-center",
            "w-full",
            "h-full"
          )}
        >
          <H1
            className={tw("text-white")}
          >{t`Please Connect to ${chainName}`}</H1>
        </div>
      </Overlay>
      {/* Safe to render unconditionally as it does not render in production
      builds by default */}
      <ReactQueryDevtools initialIsOpen={false} />
    </Fragment>
  );
};

export default App;
