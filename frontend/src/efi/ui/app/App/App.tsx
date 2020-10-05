import React, { FC, useState } from "react";
import { MainNavigation } from "efi/ui/app/MainNavigation/MainNavigation";
import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { tw } from "tailwindcss-classnames";
import Web3 from 'web3';

import styles from "./App.module.css";
import { Navigation } from "efi/app/navigation";
import { ConnectWalletEmptyState } from "efi/ui/wallets/ConnectWalletEmptyState/ConnectWalletEmptyState";
import { ActiveTab } from "../ActiveTab/ActiveTab";
import Web3Provider, { Connectors } from 'web3-react'

const { InjectedConnector, NetworkOnlyConnector } = Connectors

const MetaMask = new InjectedConnector({ supportedNetworks: [1, 4] })

const Infura = new NetworkOnlyConnector({
  providerURL: 'https://mainnet.infura.io/v3/e0fa283e03bd41229e7d19cb630f1cdd',
})

const connectors = { MetaMask, Infura }

const App: FC<{}> = () => {
  // TODO: wire this up to a real wallet connection
  const hasWalletConnection = true;

  const [activeTab, setActiveTab] = useState(Navigation.SWAP);

  return (
    <Web3Provider connectors={connectors} libraryName={'web3.js'} web3Api={Web3}>
      <div
        className={classNames(
          styles.app,
          Classes.DARK,
          tw("flex", "w-screen", "h-screen")
        )}
      >
        <MainNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Mobile */}
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
    </Web3Provider>
  );
};

export default App;
