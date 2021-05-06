import { useEffect } from "react";

import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

const __DEVELOPMENT__ = process.env.NODE_ENV === "development";
const CLEAR_PENDING_DELAY = __DEVELOPMENT__ ? 10 * 1000 : 0;

export function useClearPendingTransactionOnMined(): void {
  const {
    transactionHash,
    clearPendingTransactionPref,
  } = usePendingTransactionPref();

  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    let timeout: NodeJS.Timeout;
    jsonRpcProvider.getTransaction(transactionHash).then(({ blockHash }) => {
      // if the transaction is included in a block then it was successful, so we
      // clear the pending tx hash.
      if (blockHash) {
        const timeout = setTimeout(() => {
          clearPendingTransactionPref();
        }, CLEAR_PENDING_DELAY);
        return () => clearTimeout(timeout);
      }

      // Otherwise set a handler that will clear the pref when it is mined
      jsonRpcProvider?.once(transactionHash, () => {
        timeout = setTimeout(() => {
          return clearPendingTransactionPref();
        }, CLEAR_PENDING_DELAY);
      });
    });

    return () => clearTimeout(timeout);
  }, [clearPendingTransactionPref, transactionHash]);
}
