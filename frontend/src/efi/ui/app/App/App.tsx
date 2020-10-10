import React, { FC, useState, useEffect } from "react";
import { MainNavigation } from "efi/ui/app/MainNavigation/MainNavigation";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { tw } from "tailwindcss-classnames";

import styles from "./App.module.css";
import { Navigation } from "efi/app/navigation";
import { ConnectWalletEmptyState } from "efi/ui/wallets/ConnectWalletEmptyState/ConnectWalletEmptyState";
import { ActiveTab } from "../ActiveTab/ActiveTab";
import { useWalletConnection } from "efi/ui/wallets/hooks";
import { AppToaster, makeToast } from "efi/ui/app/AppToaster/AppToaster";

const App: FC<{}> = () => {
  const {
    isConnected: hasWalletConnection,
    error: walletConnectionError,
  } = useWalletConnection();

  useEffect(() => {
    if (walletConnectionError) {
      AppToaster.show(makeToast(walletConnectionError?.message));
    }
  }, [walletConnectionError]);

  const [activeTab, setActiveTab] = useState(Navigation.SWAP);

  return (
    <div
      className={classNames(
        styles.app,
        Classes.DARK,
        tw("flex", "w-full", "h-full", "overflow-auto")
      )}
    >
      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        className={classNames(
          tw("flex", "w-full", "h-full"),
          styles.contentContainer
        )}
      >
        {!hasWalletConnection ? (
          <ConnectWalletEmptyState />
        ) : (
          <ActiveTab activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};

export default App;
