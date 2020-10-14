import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { AppToaster, makeErrorToast } from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";
import { BigNumber } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { getConnectorName } from "efi/wallets/connectors";
import { useWalletConnection } from "efi/ui/wallets/hooks/useWalletConnection";

export interface Wallet {
  /**
   * The library that provides the API to interface with ethereum blockchain, i.e. web3 or ethers.
   */
  library: Web3Provider | undefined;

  /**
   * The Id to identify which Ethereum network the account is on.
   */
  chainId: number | undefined;

  /**
   * Account address.
   */
  account: string | null | undefined;

  /**
   * If a wallet is connected.
   */
  active: boolean;

  /**
   * Errors associated with wallet operations.
   */
  error: Error | undefined;

  /**
   * Balance of the wallet in Eth, as opposed to Wei.
   */
  ethBalance: BigNumber | null;
  /**
   * Display name of the wallet connector, i.e. MetaMask, WalletConnect.
   */
  connectorName: string | undefined;
}
export function useWallet(): Wallet {
  const { connector, library, chainId, account, active, error } = useWeb3React<
    Web3Provider
  >();

  useErrorToast(error);

  // Don't provide the account if the wallet was disconnected
  const { isDisconnected } = useWalletConnection();

  // fetch eth balance of the connected account
  const ethBalance = useEthBalance(library, account, chainId);

  const connectorName = getConnectorName(connector);

  return {
    library,
    chainId,
    account: isDisconnected ? undefined : account,
    active,
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

function useEthBalance(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  chainId: number | undefined
): BigNumber | null {
  const [ethBalance, setEthBalance] = useState<BigNumber | null>(null);
  useEffect(() => {
    if (library && account) {
      let stale = false;

      (async () => {
        let balance: BigNumber;
        try {
          balance = await library.getBalance(account);
          if (!stale) {
            setEthBalance(balance);
          }
        } catch {
          if (!stale) {
            setEthBalance(null);
          }
        }
      })();

      return () => {
        stale = true;
        setEthBalance(null);
      };
    }
  }, [library, account, chainId]);

  return ethBalance;
}

export function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return t`No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.`;
  } else if (error instanceof UnsupportedChainIdError) {
    return t`You're connected to an unsupported network.`;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return t`Please authorize this website to access your Ethereum account.`;
  } else {
    console.error(error);
    return t`An unknown error occurred. Check the console for more details.`;
  }
}
