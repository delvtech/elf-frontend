import { useEffect } from "react";
import { AppToaster, makeToast } from "efi-ui/toaster/AppToaster/AppToaster";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";

export function useTransactionToasts(): void {
  const { transactionHash } = usePendingTransaction();
  useEffect(() => {
    if (transactionHash) {
      AppToaster.show(makeToast("Transaction pending"));
      return;
    }
  }, [transactionHash]);
}
