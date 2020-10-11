import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { useEagerConnect } from "efi/ui/wallets/hooks/useEagerConnect";
import { useSyncWithInjectedEthereum } from "efi/ui/wallets/hooks/useSyncWithInjectedEthereum";
import {
  AppToaster,
  makeErrorToast,
  makeToast,
} from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";
import { BigNumber } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";

export function useWallet() {
  const {
    connector,
    library,
    chainId,
    account,
    activate,
    deactivate,
    active,
    error,
  } = useWeb3React<Web3Provider>();

  // Handle logic to recognize the connector currently being activated. This can
  // happen when the user changes to a different wallet or deactivates their
  // active wallet.
  const [activeConnector, setActiveConnector] = useState<AbstractConnector>();
  useEffect(() => {
    if (activeConnector && activeConnector === connector) {
      AppToaster.show(makeToast(t`Syncing wallet`));
      setActiveConnector(undefined);
    }
  }, [activeConnector, connector]);

  // handle logic to eagerly connect to the injected ethereum provider, eg:
  // MetaMask, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected
  // ethereum provider, ie: window.ethereum, if it exists
  useSyncWithInjectedEthereum(!triedEager || !!activeConnector);

  // fetch eth balance of the connected account
  const ethBalance = useEthBalance(library, account, chainId);

  useErrorToast(error);

  return {
    library,
    chainId,
    account,
    activate: setActiveConnector,
    deactivate,
    active,
    error,
    ethBalance,
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
