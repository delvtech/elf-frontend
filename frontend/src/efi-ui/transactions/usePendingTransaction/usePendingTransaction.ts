import { useEffect } from "react";

import { Provider } from "@ethersproject/providers";

import {
  PendingTransactionPref,
  usePendingTransactionPref,
} from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

const __DEVELOPMENT__ = process.env.NODE_ENV === "development";
const CLEAR_PENDING_DELAY = __DEVELOPMENT__ ? 10 * 1000 : 0;
/**
 * Returns a pending transaction containing the contract address, method, and
 * hash of the last transaction the user initiated in the app.  When subscribed
 * to, this hook will poll every 2 seconds and clear itself out when the
 * transaction hash is found inside the next block.
 *
 * If you're creating a new transaction, use
 * `useSmartContractTransactionPersisted` to ensure this pref is set.
 */
export function usePendingTransaction(): PendingTransactionPref {
  const {
    contractAddress,
    methodName,
    transactionHash,
    callArgs,
    clearPendingTransactionPref,
  } = usePendingTransactionPref();

  useClearPendingTransactionOnMined(
    transactionHash,
    clearPendingTransactionPref,
    jsonRpcProvider
  );

  return { contractAddress, methodName, transactionHash, callArgs };
}

function useClearPendingTransactionOnMined(
  transactionHash: string | undefined,
  clearPendingTransactionPref: () => void,
  provider: Provider | undefined
) {
  useEffect(() => {
    if (!transactionHash) {
      return;
    }

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
      provider?.once(transactionHash, () => {
        const timeout = setTimeout(() => {
          return clearPendingTransactionPref();
        }, CLEAR_PENDING_DELAY);
        return () => clearTimeout(timeout);
      });
    });
  }, [clearPendingTransactionPref, provider, transactionHash]);
}
