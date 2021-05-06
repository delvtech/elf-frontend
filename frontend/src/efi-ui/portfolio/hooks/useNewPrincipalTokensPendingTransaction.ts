import { isMintPendingTransaction } from "efi-ui/mint/isMintPendingTransaction";
import { isPrincipalTokenSwapPendingTransaction } from "efi-ui/portfolio/hooks/isPrincipalTokenSwapPendingTransaction";
import {
  PendingTransactionPref,
  usePendingTransactionPref,
} from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";

export function useNewPrincipalTokensPendingTransaction():
  | PendingTransactionPref
  | undefined {
  const pendingTransaction = usePendingTransactionPref();

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
