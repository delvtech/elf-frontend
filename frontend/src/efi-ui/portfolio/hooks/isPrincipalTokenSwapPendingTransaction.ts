import { Vault } from "elf-contracts-typechain/dist/types/Vault";

import { PendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import ContractAddresses from "efi/addresses";
import { ContractMethodArgs } from "efi/contracts/types";
import { getTokenInfo } from "efi/tokenlists";

/**
 * Returns true if the given pending transaction is for a principal token swap.
 */
export function isPrincipalTokenSwapPendingTransaction(
  pendingTransaction: PendingTransactionPref,
  principalTokenAddress?: string
): boolean {
  const { contractAddress, methodName, callArgs } = pendingTransaction;

  // no pending transactions
  if (!contractAddress || !methodName) {
    return false;
  }

  // not a balancer vault operation
  if (
    contractAddress !== ContractAddresses.balancerVaultAddress ||
    methodName !== "batchSwap"
  ) {
    return false;
  }

  // check if it's a swap for PTs
  const [, , assets] = callArgs as ContractMethodArgs<Vault, "batchSwap">;
  const principalTokenAddressFromTx = assets.find((address) => {
    const tokenInfo = getTokenInfo(address);
    return !!tokenInfo?.tags?.includes("eP");
  }) as string;

  const tokenInfo = getTokenInfo(principalTokenAddressFromTx);

  // We support checking if a specific PT has a pending tx
  if (principalTokenAddress) {
    const matches = tokenInfo.address === principalTokenAddress;
    return matches;
  }

  return !!tokenInfo;
}
