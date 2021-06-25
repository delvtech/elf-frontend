import { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { FocusStyleManager, H1, Overlay } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { LocationProvider, Redirect, Router } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import { tw } from "efi-tailwindcss-classnames";
import { EarnView } from "efi-ui/earn/EarnView/EarnView";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { PoolsView } from "efi-ui/pools/PoolsView/PoolsView";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { PortfolioView } from "efi-ui/portfolio/PortfolioView/PortfolioView";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTransactionToasts } from "efi-ui/transactions/useTransactionToasts";
import { useEagerConnect } from "efi-ui/wallets/hooks/useEagerReconnect";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./App.module.css";
import { useToastWrongChain } from "efi-ui/provider/useBlockFromTag/useToastWrongChain";
import { TopbarNavigation } from "efi-ui/app/navigation/TopbarNavigation/TopbarNavigation";
import { getConnectorName } from "efi/wallets/connectors";
import { NavigationMenuButton } from "efi-ui/app/navigation/EarnHamburgerButton/EarnHamburgerButton";

FocusStyleManager.onlyShowFocusOnTabs();

interface AppProps {}

const App: FC<AppProps> = () => {
  const { active, account, chainId, deactivate, connector, library } =
    useWeb3React<Web3Provider>();
  const onMainnet = active && chainId === 1;

  const { isDarkMode, darkModeClassName } = useDarkMode();

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
          tw("flex", "flex-col", "w-full", "h-full", "overflow-hidden")
        )}
      >
        <LocationProvider>
          <TopbarNavigation
            account={account}
            active={active}
            chainId={chainId}
            connectorName={getConnectorName(connector, library)}
            deactivate={deactivate}
            hamburgerButton={<NavigationMenuButton />}
          />
        </LocationProvider>

        <Router
          className={tw("flex", "flex-1", "w-full", "h-full", "overflow-auto")}
        >
          <Redirect noThrow from="/" to={Navigation.EARN} />

          <PortfolioView path={Navigation.PORTFOLIO} />
          <EarnView path={Navigation.EARN} />
          <PoolsView path={Navigation.TRADE} />
          <PoolView path={`pools/:poolAddress`} />
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
          <H1
            className={styles.overlay}
          >{t`Please Connect to Goerli Testnet`}</H1>
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
                {t`Mobile Compatibility Coming with Mainnet Launch`}
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
