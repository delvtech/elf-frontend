import { isMintPendingTransaction } from "efi-ui/mint/isMintPendingTransaction";
import { isPrincipalTokenSwapPendingTransaction } from "efi-ui/portfolio/hooks/isPrincipalTokenSwapPendingTransaction";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";
import { PendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";

export function useNewPrincipalTokensPendingTransaction():
  | PendingTransactionPref
  | undefined {
  const pendingTransaction = usePendingTransaction();

  // minting new pts and yts
  if (isMintPendingTransaction(pendingTransaction)) {
    return pendingTransaction;
  }

  // swaps for pts
  if (isPrincipalTokenSwapPendingTransaction(pendingTransaction)) {
    return pendingTransaction;
  }

  return;
}
