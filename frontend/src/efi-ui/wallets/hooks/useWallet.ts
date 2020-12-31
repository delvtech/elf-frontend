import { Web3Provider } from "@ethersproject/providers";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { formatEther } from "ethers/lib/utils";
import { useEffect } from "react";
import { Money } from "ts-money";
import { t } from "ttag";

import { useEthBalance } from "efi-ui/coins/ether/hooks/useEthBalance/useEthBalance";
import { useEthPrice } from "efi-ui/coins/ether/hooks/useEthBalance/useEthPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import {
  AppToaster,
  makeErrorToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { useWalletConnectionStatus } from "efi-ui/wallets/hooks/useWalletConnectionStatus";
import { getConnectorName } from "efi/wallets/connectors";

export interface Wallet {
  /**
   * The wallet address if it is connected
   */
  accountAddress: string | null | undefined;

  /**
   * Errors associated with wallet operations.
   */
  error: Error | undefined;

  /**
   * The real world value of the Eth in the wallet (doesn't include token values).
   */
  fiatBalance: Money | undefined;

  /**
   * Display name of the wallet connector, i.e. MetaMask, WalletConnect.
   */
  connectorName: string | undefined;
}

export function useWallet(): Wallet {
  const web3React = useWeb3React<Web3Provider>();
  const { connector, library, account: accountAddress, error } = web3React;
  useErrorToast(error);
  setWeb3ReactOnWindow(web3React);
  useWalletConnectionStatus();

  const { data: ethBalance } = useEthBalance(library, accountAddress);

  // Manages the toasts for connections
  const { currency } = useCurrencyPref();
  const { data: ethPrice } = useEthPrice(currency.code);

  let fiatBalance: Money | undefined;
  if (ethPrice && ethBalance) {
    // Money wants the atomic value, it handles formatting.
    const fractionalAmount = Math.floor(
      ethPrice * +formatEther(ethBalance) * 10 ** currency.decimal_digits
    );
    fiatBalance = new Money(fractionalAmount, currency.code);
  }

  const connectorName = getConnectorName(connector, library);

  return {
    accountAddress,
    error,
    fiatBalance,
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

function getErrorMessage(error: Error) {
  // These are the well-known error types
  if (error instanceof NoEthereumProviderError) {
    return t`No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.`;
  } else if (error instanceof UnsupportedChainIdError) {
    return t`You're connected to an unsupported network.`;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return t`Please authorize this website to access your Ethereum account.`;
  }

  // show unknown errors with messages in development.  we shouldn't show messages for things we
  // don't know about since they could be technical.
  if (error.message && process.env.NODE_ENV !== "production") {
    return error.message;
  }

  // Final resort, it's an unknown error
  console.error(error);
  return t`An unknown error occurred. Check the console for more details.`;
}

/**
 * helper function to put web3React on the global scope for debugging
 * @param web3React
 */
function setWeb3ReactOnWindow(
  web3React: Web3ReactContextInterface<Web3Provider>
) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test"
  ) {
    return;
  }

  window.__web3React = web3React;
}
