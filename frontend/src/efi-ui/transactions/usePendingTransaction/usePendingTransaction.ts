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
  // If the tx cleared while the user was not in the app, clear it out
  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    const clearIfMined = async () => {
      // if the transaction is included in a block then it was successful, so we
      // clear the pending tx hash.
      const { blockHash } = await jsonRpcProvider.getTransaction(
        transactionHash
      );
      if (blockHash) {
        setTimeout(() => clearPendingTransactionPref(), CLEAR_PENDING_DELAY);
      }
    };

    clearIfMined();
  }, [clearPendingTransactionPref, transactionHash]);

  useEffect(() => {
    if (!transactionHash) {
      return;
    }

    provider?.once(transactionHash, () => {
      setTimeout(() => clearPendingTransactionPref(), CLEAR_PENDING_DELAY);
    });
  }, [clearPendingTransactionPref, provider, transactionHash]);
}
