import { isMintPendingTransaction } from "elf-ui/mint/isMintPendingTransaction";
import { isPrincipalTokenSwapPendingTransaction } from "elf-ui/portfolio/hooks/isPrincipalTokenSwapPendingTransaction";
import {
  PendingTransactionPref,
  usePendingTransactionPref,
} from "elf-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";

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
