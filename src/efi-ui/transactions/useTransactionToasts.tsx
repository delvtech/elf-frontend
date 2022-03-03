import { useEffect } from "react";

import { t } from "ttag";

import { ETHERSCAN_DOMAIN } from "integrations/efi-etherscan/ETHERSCAN_DOMAIN";
import {
  AppToaster,
  makeSuccessToast,
  makeToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { defaultProvider } from "efi/providers/providers";
import { TransactionStatus } from "efi/contracts/transaction";
import { Intent } from "@blueprintjs/core";

export function useTransactionToasts(): void {
  useToastOnPending();
  useToastOnMined();
}

function useToastOnPending() {
  const { transactionHash, transactionStatus } = usePendingTransactionPref();
  useEffect(() => {
    if (transactionHash && transactionStatus === TransactionStatus.SUBMITTED) {
      AppToaster?.show({
        ...makeToast(t`Transaction pending`, {
          text: (
            <a
              href={`${ETHERSCAN_DOMAIN}/tx/${transactionHash}`}
              rel="noreferrer"
              target={"_blank"}
            >{t`View on etherscan`}</a>
          ),
        }),
        intent: Intent.PRIMARY,
      });
      return;
    }
  }, [transactionHash, transactionStatus]);
}

function useToastOnMined() {
  const { transactionHash, transactionStatus, clearPendingTransactionPref } =
    usePendingTransactionPref();
  useEffect(() => {
    if (!transactionHash || transactionStatus === TransactionStatus.SUBMITTED) {
      return;
    }

    // cancelled tx have been mined, so we should clear the pending tx pref, but
    // not toast about it.
    if (transactionStatus === TransactionStatus.CANCELLED) {
      clearPendingTransactionPref();
      return;
    }

    const handleTransactionMined = () => {
      AppToaster?.show(
        makeSuccessToast(t`Transaction complete`, {
          href: `${ETHERSCAN_DOMAIN}/tx/${transactionHash}`,
          target: "_blank",
          text: (
            <a
              href={`${ETHERSCAN_DOMAIN}/tx/${transactionHash}`}
              rel="noreferrer"
              target={"_blank"}
            >{t`View on etherscan`}</a>
          ),
        })
      );

      // Clear the pending tx after we've toasted about it.
      clearPendingTransactionPref();
    };

    (async () => {
      const tx = await defaultProvider.getTransaction(transactionHash);
      if (tx) {
        defaultProvider?.once(transactionHash, handleTransactionMined);
      }
    })();

    return () => {
      defaultProvider?.off(transactionHash, handleTransactionMined);
    };
  }, [clearPendingTransactionPref, transactionHash, transactionStatus]);
}
