import { useWeb3React } from "@web3-react/core";
import { useState, useEffect, useCallback } from "react";
import { useSyncWithInjectedEthereum } from "efi/ui/wallets/hooks/useSyncWithInjectedEthereum";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { AppToaster, makeSuccessToast } from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";

export function useWalletConnection() {
  const { connector, activate, deactivate } = useWeb3React<Web3Provider>();

  // Hold onto the connector while it's connection status is pending, eg: for
  // MetaMask, this occurs while the user is being prompted to grant access.
  const [pendingConnector, setPendingConnector] = useState<AbstractConnector>();
  const isPending = !!pendingConnector;
  useEffect(() => {
    if (isPending && connector === pendingConnector) {
      setPendingConnector(undefined);
    }
  }, [pendingConnector, connector, isPending]);

  // Track when the user connects and disconnects.
  const [isDisconnected, setDisconnected] = useState(false);

  const connect = useCallback(
    async (connector: AbstractConnector) => {
      setPendingConnector(connector);
      await activate(connector, undefined, true);
      AppToaster.show(makeSuccessToast(t`Connected`));
      setDisconnected(false);
    },
    [activate]
  );

  // handle logic to connect in reaction to certain events on the injected
  // ethereum provider, ie: window.ethereum, if it exists
  const suppress = isPending;
  useSyncWithInjectedEthereum(connect, suppress);

  const disconnect = useCallback(() => {
    setDisconnected(true);
    deactivate();
    AppToaster.show(makeSuccessToast(t`Disconnected`));
  }, [deactivate]);

  return {
    disconnect,
    connect,
    pendingConnector,
    isPending,
    isDisconnected,
  };
}
