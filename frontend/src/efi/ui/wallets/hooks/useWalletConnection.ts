import { useWeb3React } from "@web3-react/core";
import { useState, useCallback } from "react";
import { useSyncWithInjectedEthereum } from "efi/ui/wallets/hooks/useSyncWithInjectedEthereum";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { AppToaster, makeSuccessToast } from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";
import { useMutation } from "react-query";

interface WalletConnection {
  disconnect: () => void;
  connect: (connector: AbstractConnector) => void;
  status: WalletConnectionStatus;
}

export enum WalletConnectionStatus {
  /**
   * When the user has been prompted to authorize the app, but has yet to do
   * so.
   */
  PENDING = "pending",

  /**
   * When the user has disconnected their wallet.
   *
   * Note: Being disconnected does not mean the user has de-authorized their
   * wallet from the app, ie: it would not be safe to walk away from the
   * computer. We should use this to allow users to pick a different wallet,
   * but never to suggest that they have actually disconnected.
   */
  DISCONNECTED = "disconnected",

  /**
   * When the user has a connected wallet.
   */
  CONNECTED = "connected",
}

export function useWalletConnection(): WalletConnection {
  const { activate, deactivate } = useWeb3React<Web3Provider>();
  const [status, setStatus] = useState(WalletConnectionStatus.DISCONNECTED);

  const [connect] = useMutation(
    (connector: AbstractConnector) => {
      return activate(connector, undefined, true);
    },
    {
      onMutate: () => {
        // Hold onto the connector until the user grants authorization from
        // their wallet app. We can use this to show a message or spinner.
        setStatus(WalletConnectionStatus.PENDING);
      },
      onSuccess: () => {
        AppToaster.show(makeSuccessToast(t`Connected`));
        setStatus(WalletConnectionStatus.CONNECTED);
      },
    }
  );

  const disconnect = useCallback(() => {
    deactivate();
    setStatus(WalletConnectionStatus.DISCONNECTED);
    AppToaster.show(makeSuccessToast(t`Disconnected`));
  }, [deactivate]);

  // handle logic to connect in reaction to certain events on the injected
  // ethereum provider, ie: window.ethereum, if it exists
  const suppress = status === WalletConnectionStatus.PENDING;
  useSyncWithInjectedEthereum(connect, suppress);

  return {
    disconnect,
    connect,
    status,
  };
}
