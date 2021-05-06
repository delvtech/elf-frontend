import { useEffect } from "react";
import {
  AppToaster,
  makeSuccessToast,
  makeToast,
} from "efi-ui/toaster/AppToaster/AppToaster";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";

export function useTransactionToasts(): void {
  useToastOnPending();
  useToastOnMined();
}

function useToastOnPending() {
  const { transactionHash } = usePendingTransactionPref();
  useEffect(() => {
    if (transactionHash) {
      AppToaster.show(makeToast("Transaction pending"));
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
        AppToaster.show(makeSuccessToast("Transaction complete"));
      });
    });
  }, [transactionHash]);
}
