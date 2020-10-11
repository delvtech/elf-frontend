import Web3Modal, { getInjectedProvider } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useCallback } from "react";

import { INFURA_ID } from "infura";
import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";
import { Intent, Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

/**
 *  Initialize the Web3Modal
 */
export function initalizeWeb3Modal() {
  // MetaMask is added automatically by Web3modal, add the WalletConnect
  // proivder as well.
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
  };

  return new Web3Modal({
    providerOptions,
    theme: "dark",
    cacheProvider: false,
  });
}

interface ModalWallet {
  /**
   * opens a modal to connect a wallet to.
   */
  connectWallet: () => void;

  /**
   * disconnects from the currently connected account.
   */
  disconnectWallet: () => void;
}
export const useModalWallet = (): ModalWallet => {
  return {
    connectWallet,
    disconnectWallet,
  };
};

/**
 * Connects to an ethereum wallet using Web3Modal.
 */
async function connectWallet() {
  const web3Modal = initalizeWeb3Modal();
  web3Modal.clearCachedProvider();
  // TODO: figure out typing for this
  // Wallet Provider
  let provider: any;

  try {
    provider = await web3Modal.connect();
  } catch (e) {
    const errorToast = makeErrorToast(t`Wallet connection failed.`);
    AppToaster.show(errorToast);
    return;
  }

  if (!provider?.on) {
    return;
  }

  provider.on("accountsChanged", (accounts: string[]) => {
    if (!accounts.length) {
      AppToaster.show({
        message: t`Disconnected from all wallets.`,
        className: Classes.DARK,
      });
    } else {
      const connectedToast = makeSuccessToast(t`Connected to ${accounts}`);
      AppToaster.show(connectedToast);
    }
  });

  // TODO: add functionality here
  provider.on("chainChanged", (chainId: string) => {
    console.log("chainId", chainId);
  });

  provider.on("networkChanged", (networkId: string) => {
    console.log("networkId", networkId);
  });

  return provider;
}

/**
 * Disconnects from an ethereum walleting Web3Modal.
 */
async function disconnectWallet() {
  // TODO: figure out typing for this
  // Wallet Provider
  const provider: any = getInjectedProvider();

  // TODO: fix this!  Disconnecting from the procider seems to a known issue.
  // When we add support for more provider types, we should make sure we can
  // disconnect from each one easily.
  if (provider) {
    await provider.close();
  }

  // WalletConnect will default to the existing session if you don't clear
  // cache and you won't be able to re-scan QR code.

  // CLEAR CAHE PROVIDER HERE
}
