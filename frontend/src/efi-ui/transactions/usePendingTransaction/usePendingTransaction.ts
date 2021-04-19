import { usePendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useInterval } from "react-use";

export function usePendingTransaction(): string | undefined {
  const { transactionHash, setTransaction } = usePendingTransactionPref();
  useInterval(async () => {
    if (!transactionHash) {
      return;
    }

    const transaction = await jsonRpcProvider.getTransaction(transactionHash);
    const { blockHash } = transaction;

    // if the transaction is included in a block then it was successful, so we clear the pending tx
    // hash.
    if (blockHash) {
      setTransaction(undefined);
    }
  }, 2000);

  return transactionHash;
}
