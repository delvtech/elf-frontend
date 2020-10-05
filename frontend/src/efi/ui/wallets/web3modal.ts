import Web3Modal, { getInjectedProvider } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useCallback } from "react";

import { INFURA_ID } from "efi/app/infura";

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
      }
    },
  };

  return new Web3Modal({
    providerOptions,
    theme: 'dark',
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
    connectWallet: useCallback(() => { connectWallet(); }, []),
    disconnectWallet: useCallback(disconnectWallet, []),
  }
}

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
  } catch(e) {
    console.error("Wallet connection failed", e);
    return;
  }

  if (!provider?.on) {
    return;
  }

  // TODO: add functionality here
  provider.on("accountsChanged", (accounts: string[]) => {
    console.log('accounts', accounts);
  });

  // TODO: add functionality here
  provider.on("chainChanged", (chainId: string) => {
    console.log('chainId', chainId);
  });

  // TODO: add functionality here
  provider.on("networkChanged", (networkId: string) => {
    console.log('networkId', networkId);
  });
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