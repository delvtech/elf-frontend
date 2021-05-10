import { useCallback } from "react";

import { usePref } from "efi-ui/prefs/usePref/usePref";

export interface PendingTransactionPref {
  contractAddress: string | undefined;
  transactionHash: string | undefined;
  methodName: string | undefined;
  callArgs: unknown[] | undefined;
}

interface UsePendingTransactionPref extends PendingTransactionPref {
  setPendingTransactionPref: (
    contractAddress: string | undefined,
    methodName: string | undefined,
    callArgs: unknown[],
    transactionHash: string | undefined
  ) => void;
  clearPendingTransactionPref: () => void;
}

const PENDING_TRANSACTION_PREF_ID = "pending-transaction";

/**
 * A pref that holds the user's transaction while it's still pending on the
 * network.  This can be used to show toasts, disable other transaction
 * buttons, or render "loading" states.
 */
export function usePendingTransactionPref(): UsePendingTransactionPref {
  const { pref, setPref } = usePref<PendingTransactionPref | undefined>(
    PENDING_TRANSACTION_PREF_ID,
    undefined
  );
  const clearPendingTransaction = useCallback(() => {
    setPref(undefined);
  }, [setPref]);

  const setPendingTransaction = useCallback(
    (
      contractAddress: string | undefined,
      methodName: string | undefined,
      callArgs: unknown[] | undefined,
      transactionHash: string | undefined
    ) => {
      if (!contractAddress || !methodName || !transactionHash) {
        setPref(undefined);
        return;
      }
      setPref({ contractAddress, methodName, callArgs, transactionHash });
    },
    [setPref]
  );

  return {
    contractAddress: pref?.contractAddress,
    transactionHash: pref?.transactionHash,
    methodName: pref?.methodName,
    callArgs: pref?.callArgs,
    setPendingTransactionPref: setPendingTransaction,
    clearPendingTransactionPref: clearPendingTransaction,
  };
}
