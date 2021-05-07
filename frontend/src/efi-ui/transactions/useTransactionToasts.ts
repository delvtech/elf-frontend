import { useEffect } from "react";

import { t } from "ttag";

import {
  AppToaster,
  makeSuccessToast,
  makeToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { Intent } from "@blueprintjs/core";
import { ETHERSCAN_DOMAIN } from "efi-etherscan/ETHERSCAN_DOMAIN";

export function useTransactionToasts(): void {
  useToastOnPending();
  useToastOnMined();
}

function useToastOnPending() {
  const { transactionHash } = usePendingTransactionPref();
  useEffect(() => {
    if (transactionHash) {
      AppToaster.show(
        makeToast(t`Transaction pending`, {
          href: `${ETHERSCAN_DOMAIN}/tx/${transactionHash}`,
          target: "_blank",
          text: t`View`,
          intent: Intent.PRIMARY,
        })
      );
      return;
    }
  }, [transactionHash]);
}

function useToastOnMined() {
  const { transactionHash } = usePendingTransactionPref();
  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    jsonRpcProvider.getTransaction(transactionHash).then(({ blockHash }) => {
      // Otherwise set a handler that will clear the pref when it is mined
      jsonRpcProvider?.once(transactionHash, () => {
        AppToaster.show(
          makeSuccessToast(t`Transaction complete`, {
            href: `${ETHERSCAN_DOMAIN}/tx/${transactionHash}`,
            target: "_blank",
            text: t`View`,
            intent: Intent.SUCCESS,
          })
        );
      });
    });
  }, [transactionHash]);
}
