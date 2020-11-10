import { useEffect } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { BigNumber } from "ethers";
import { t } from "ttag";

import { AppToaster, makeErrorToast } from "efi/ui/app/AppToaster/AppToaster";
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";
import { useWalletConnectionStatus } from "efi/ui/wallets/hooks/useWalletConnectionStatus";
import { getConnectorName } from "efi/wallets/connectors";

export interface Wallet {
  /**
   * The library that provides the API to interface with ethereum blockchain, i.e. web3 or ethers.
   */
  library: Web3Provider | undefined;

  /**
   * The wallet address if it is connected
   */
  account: string | null | undefined;

  /**
   * Errors associated with wallet operations.
   */
  error: Error | undefined;

  /**
   * Balance of the wallet in Eth, as opposed to Wei.
   */
  ethBalance: BigNumber | undefined;
  /**
   * Display name of the wallet connector, i.e. MetaMask, WalletConnect.
   */
  connectorName: string | undefined;
}

export function useWallet(): Wallet {
  const web3React = useWeb3React<Web3Provider>();
  setWeb3ReactOnWindow(web3React);
  const { connector, library, account, error } = web3React;

  // Manages the toasts for connections
  useWalletConnectionStatus();

  useErrorToast(error);

  const { data: ethBalance } = useWalletBalance();

  const connectorName = getConnectorName(connector);

  return {
    library,
    account,
    error,
    ethBalance,
    connectorName,
  };
}

function useErrorToast(error: Error | undefined) {
  useEffect(() => {
    if (error) {
      const errorToast = makeErrorToast(getErrorMessage(error));
      AppToaster.show(errorToast);
    }
  }, [error]);
}

export function getErrorMessage(error: Error) {
  // These are the well-known error types
  if (error instanceof NoEthereumProviderError) {
    return t`No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.`;
  } else if (error instanceof UnsupportedChainIdError) {
    return t`You're connected to an unsupported network.`;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return t`Please authorize this website to access your Ethereum account.`;
  }

  // Otherwise check if the error has it's own message we can show
  if (error.message) {
    return error.message;
  }

  // Final resort, it's an unknown error
  console.error(error);
  return t`An unknown error occurred. Check the console for more details.`;
}

function setWeb3ReactOnWindow(
  web3React: Web3ReactContextInterface<Web3Provider>
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  window.__web3React = web3React;
}
