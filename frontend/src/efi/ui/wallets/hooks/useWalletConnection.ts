import { useWeb3React } from "@web3-react/core";
import { useState, useCallback } from "react";
import { useSyncWithInjectedEthereum } from "efi/ui/wallets/hooks/useSyncWithInjectedEthereum";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { AppToaster, makeSuccessToast } from "efi/ui/app/AppToaster/AppToaster";
import { t } from "ttag";
import { useMutation } from "react-query";

export function useWalletConnection() {
  const { activate, deactivate } = useWeb3React<Web3Provider>();
  const [pendingConnector, setPendingConnector] = useState<
    AbstractConnector | undefined
  >();

  // Track when the user connects and disconnects.
  const [isDisconnected, setDisconnected] = useState(false);

  const [connect] = useMutation(
    (connector: AbstractConnector) => {
      return activate(connector, undefined, true);
    },
    {
      onMutate: (connector: AbstractConnector) => {
        setPendingConnector(connector);
      },
      onSuccess: () => {
        AppToaster.show(makeSuccessToast(t`Connected`));
        setDisconnected(false);
        setPendingConnector(undefined);
      },
    }
  );

  const disconnect = useCallback(() => {
    setDisconnected(true);
    deactivate();
    AppToaster.show(makeSuccessToast(t`Disconnected`));
  }, [deactivate]);

  // handle logic to connect in reaction to certain events on the injected
  // ethereum provider, ie: window.ethereum, if it exists
  const isPending = !!pendingConnector;
  const suppress = isPending;
  useSyncWithInjectedEthereum(connect, suppress);

  return {
    disconnect,
    connect,
    isPending,
    isDisconnected,
  };
}
