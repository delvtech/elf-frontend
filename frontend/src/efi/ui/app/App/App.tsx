import React, { FC, useState } from "react";
import { MainNavigation } from "efi/ui/app/MainNavigation/MainNavigation";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { tw } from "tailwindcss-classnames";

import styles from "./App.module.css";
import { Navigation } from "efi/app/navigation";
import { ConnectWalletEmptyState } from "efi/ui/wallets/ConnectWalletEmptyState/ConnectWalletEmptyState";
import { ActiveTab } from "../ActiveTab/ActiveTab";
import { useWalletConnection } from "efi/ui/wallets/hooks";

const App: FC<{}> = () => {
  const hasWalletConnection = useWalletConnection();
  const [activeTab, setActiveTab] = useState(Navigation.SWAP);

  return (
    <div
      className={classNames(
        styles.app,
        Classes.DARK,
        tw("flex", "w-screen", "h-screen")
      )}
    >
      <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        className={classNames(
          tw("flex", "w-screen", "h-screen"),
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
