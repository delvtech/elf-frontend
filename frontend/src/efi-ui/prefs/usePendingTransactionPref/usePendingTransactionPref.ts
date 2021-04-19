import { usePref } from "efi-ui/prefs/usePref/usePref";

interface PendingTransactionPref {
  transactionHash: string | undefined;
  setTransaction: (transactionHash: string | undefined) => void;
}

const PENDING_TRANSACTION_PREF_ID = "pending-transaction";

export function usePendingTransactionPref(): PendingTransactionPref {
  const { pref: transactionHash, setPref: setTransaction } = usePref<
    string | undefined
  >(PENDING_TRANSACTION_PREF_ID, undefined);

  return {
    transactionHash,
    setTransaction,
  };
}
