import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { useState, useEffect, useCallback } from "react";
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
import { getConnectorName } from "efi/wallets/connectors";

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
  const { setActiveConnector, isPending } = useActiveConnector(
    connector,
    activate
  );

  // fetch eth balance of the connected account
  const ethBalance = useEthBalance(library, account, chainId);

  const connectorName = useConnectorName(library, connector);

  useErrorToast(error);

  return {
    library,
    chainId,
    account,
    setActiveConnector,
    isPending,
    deactivate,
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

function useActiveConnector(
  connector: AbstractConnector | undefined,
  activate: (connector: AbstractConnector) => void
) {
  const [pendingConnector, setPendingConnectorState] = useState<
    AbstractConnector
  >();
  const isPending = !!pendingConnector;

  // Handle clearing out the pending connector
  useEffect(() => {
    if (isPending && pendingConnector === connector) {
      AppToaster.show(makeToast(t`Wallet connected.`));
      setPendingConnectorState(undefined);
    }
  }, [pendingConnector, connector, isPending]);

  const setActiveConnector = useCallback(
    (connector: AbstractConnector) => {
      setPendingConnectorState(connector);
      activate(connector);
    },
    [activate]
  );

  // handle logic to eagerly connect to the injected ethereum provider, eg:
  // MetaMask, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected
  // ethereum provider, ie: window.ethereum, if it exists
  const suppress = !triedEager || isPending;
  useSyncWithInjectedEthereum(suppress);

  return {
    setActiveConnector,
    pendingConnector,
    isPending: !!pendingConnector,
  };
}

function useConnectorName(
  library: Web3Provider | undefined,
  connector: AbstractConnector | undefined
): string {
  const [connectorName, setConnectorName] = useState(t`No connection.`);

  useEffect(() => {
    if (!library) {
      return;
    }

    setConnectorName(getConnectorName(library, connector));
  }, [connector, library]);

  return connectorName;
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
