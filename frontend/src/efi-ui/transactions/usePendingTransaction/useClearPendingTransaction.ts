import { useEffect } from "react";

import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useClearPendingTransactionOnMined(): void {
  const {
    transactionHash,
    clearPendingTransactionPref,
  } = usePendingTransactionPref();

  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    (async () => {
      const tx = await jsonRpcProvider.getTransaction(transactionHash);
      if (tx) {
        const { blockHash } = tx;
        // if the transaction is included in a block then it was successful, so we
        // clear the pending tx hash.
        if (blockHash) {
          clearPendingTransactionPref();
        }
      }
      // Otherwise set a handler that will clear the pref when it is mined
      jsonRpcProvider?.once(transactionHash, clearPendingTransactionPref);
    })();

    return () => {
      jsonRpcProvider.off(transactionHash, clearPendingTransactionPref);
    };
  }, [clearPendingTransactionPref, transactionHash]);
}
