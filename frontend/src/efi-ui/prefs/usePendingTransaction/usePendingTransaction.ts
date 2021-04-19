import { usePref } from "efi-ui/prefs/usePref/usePref";

interface PendingTransactionPref {
  transactionHash: string | undefined;
  setTransaction: (transactionHash: string) => void;
}

const PENDING_TRANSACTION_PREF_ID = "pending-transaction";

export function usePendingTransaction(): PendingTransactionPref {
  const { pref: transactionHash, setPref: setTransaction } = usePref<
    string | undefined
  >(PENDING_TRANSACTION_PREF_ID, undefined);

  return {
    transactionHash,
    setTransaction,
  };
}
