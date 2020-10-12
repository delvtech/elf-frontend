import React, { FC, useState } from "react";
import { MainNavigation } from "efi/ui/app/MainNavigation/MainNavigation";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { tw } from "tailwindcss-classnames";

import styles from "./App.module.css";
import { Navigation } from "efi/app/navigation";
import { ConnectWalletEmptyState } from "efi/ui/wallets/ConnectWalletEmptyState/ConnectWalletEmptyState";
import { ActiveTab } from "../ActiveTab/ActiveTab";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";

const App: FC<{}> = () => {
  const { account } = useWallet();

  const [activeTab, setActiveTab] = useState(Navigation.SWAP);

  return (
    <div
      className={classNames(
        styles.app,
        Classes.DARK,
        tw("flex", "w-full", "h-full", "overflow-auto")
      )}
    >
      <MainNavigation activeTab={activeTab} onSetActiveTab={setActiveTab} />

      <div
        className={classNames(
          tw("flex", "w-full", "h-full"),
          styles.contentContainer
        )}
      >
        {!account ? (
          <ConnectWalletEmptyState />
        ) : (
          <ActiveTab activeTab={activeTab} />
        )}
      </div>
    </div>
  );
};

export default App;
