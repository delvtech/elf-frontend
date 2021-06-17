import React, { FC, Fragment } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { FocusStyleManager, H1, Overlay } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Router } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";

import { tw } from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SaveView } from "efi-ui/save/SaveView/SaveView";
import { useTransactionToasts } from "efi-ui/transactions/useTransactionToasts";
import { useEagerConnect } from "efi-ui/wallets/hooks/useEagerReconnect";
import { useSyncWithInjectedEthereum } from "efi-ui/wallets/hooks/useSyncWithInjectedEthereum";

import styles from "./SaveApp.module.css";

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

interface SaveAppProps {}

const SaveApp: FC<SaveAppProps> = () => {
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
  useTransactionToasts();

  return (
    <Fragment>
      <div className={appClassName}>
        <Router className={contentClassName}>
          <SaveView path={"/"} />
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

export default SaveApp;
