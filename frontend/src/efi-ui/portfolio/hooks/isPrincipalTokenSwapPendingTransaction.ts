import { Vault } from "elf-contracts/types/Vault";

import { PendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import ContractAddresses from "efi/addresses";
import { ContractMethodArgs } from "efi/contracts/types";
import { TokenMetadata } from "efi/tokenlists";

/**
 * Returns true if the given pending transaction is for a principal token swap.
 */
export function isPrincipalTokenSwapPendingTransaction(
  pendingTransaction: PendingTransactionPref
): boolean {
  const { contractAddress, methodName, callArgs } = pendingTransaction;

  // no pending transactions
  if (!contractAddress || !methodName) {
    return false;
  }

  // swaps for pts
  if (
    contractAddress === ContractAddresses.balancerVaultAddress &&
    methodName === "batchSwap"
  ) {
    const [, , assets] = callArgs as ContractMethodArgs<Vault, "batchSwap">;
    const isPT = !!assets.find((address) => {
      return !!TokenMetadata[address]?.tags?.includes("eP");
    });
    if (isPT) {
      return true;
    }
  }

  return false;
}
