import { useEffect } from "react";

import { Intent } from "@blueprintjs/core";
import { t } from "ttag";

import { ETHERSCAN_DOMAIN } from "efi-etherscan/ETHERSCAN_DOMAIN";
import {
  AppToaster,
  makeSuccessToast,
  makeToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { defaultProvider } from "efi/providers/providers";

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
    (async () => {
      const tx = await defaultProvider.getTransaction(transactionHash);
      if (tx) {
        defaultProvider?.once(transactionHash, () => {
          AppToaster.show(
            makeSuccessToast(t`Transaction complete`, {
              href: `${ETHERSCAN_DOMAIN}/tx/${transactionHash}`,
              target: "_blank",
              text: t`View`,
              intent: Intent.SUCCESS,
            })
          );
        });
      }
    })();
  }, [transactionHash]);
}
