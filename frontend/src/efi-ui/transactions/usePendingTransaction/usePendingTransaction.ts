import { usePendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useEffect, useState } from "react";
import { useInterval } from "react-use";

const __DEVELOPMENT__ = process.env.NODE_ENV === "development";
const CLEAR_PENDING_DELAY = __DEVELOPMENT__ ? 10 * 1000 : 0;
export function usePendingTransaction(): string | undefined {
  const { transactionHash, setTransaction } = usePendingTransactionPref();

  const [newHashValue, setNewValue] = useState(transactionHash);
  useEffect(() => {
    if (!newHashValue && transactionHash) {
      setTimeout(() => setTransaction(undefined), CLEAR_PENDING_DELAY);
    }
  }, [newHashValue, setTransaction, transactionHash]);

  useInterval(async () => {
    if (!transactionHash) {
      return;
    }

    const transaction = await jsonRpcProvider.getTransaction(transactionHash);
    if (!transaction) {
      return;
    }
    const { blockHash } = transaction;

    // if the transaction is included in a block then it was successful, so we clear the pending tx
    // hash.
    if (blockHash) {
      setNewValue(undefined);
    }
  }, 2000);

  return transactionHash;
}
