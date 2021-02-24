import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { QueryObserverResult, useQuery } from "react-query";
import { usePrevious } from "react-use";
import { t } from "ttag";

import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi-ui/toaster/AppToaster/AppToaster";

export enum WalletConnectionStatus {
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

export function useWalletConnectionStatus(): [
  WalletConnectionStatus | undefined,
  QueryObserverResult<WalletConnectionStatus>
] {
  const { active } = useWeb3React<Web3Provider>();

  const result = useQuery<WalletConnectionStatus>({
    queryKey: ["wallet-connection-status", active],
    queryFn: () => {
      const newStatus = getStatus(active);

      // Only show the toast when we set the newStatus to true.
      if (newStatus === WalletConnectionStatus.CONNECTED) {
        AppToaster.show(makeSuccessToast(t`Connected`));
      }

      if (newStatus === WalletConnectionStatus.DISCONNECTED) {
        AppToaster.show(makeErrorToast(t`Disconnected`, IconNames.TICK));
      }

      return newStatus;
    },
    refetchOnMount: false,
  });
  const { data: status, refetch: refetchStatus } = result;

  useRefetchStatusWhenStale(status, refetchStatus);

  return [status, result];
}

function useRefetchStatusWhenStale(
  status: WalletConnectionStatus | undefined,
  refetchStatus: () => void
) {
  const { active } = useWeb3React<Web3Provider>();

  const prevStatus = usePrevious(status);

  useEffect(() => {
    // Don't force refetch when status hasn't been set. This means the initial
    // query is still pending, so refetching would just lead to extra toasts.
    if (!status || !prevStatus) {
      return;
    }

    // Don't force refetch if the status hasn't changed
    if (prevStatus === status) {
      return;
    }

    // Force refetch the stats when `active` changes
    refetchStatus();
  }, [active, prevStatus, refetchStatus, status]);
}

function getStatus(active: boolean) {
  if (active) {
    return WalletConnectionStatus.CONNECTED;
  }
  return WalletConnectionStatus.DISCONNECTED;
}
