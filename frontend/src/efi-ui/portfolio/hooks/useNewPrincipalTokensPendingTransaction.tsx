import ContractAddresses from "efi/addresses";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";
import { ContractMethodArgs } from "efi/contracts/types";
import { Vault } from "elf-contracts/types/Vault";
import { TokenMetadata } from "efi/tokenlists";
import { PendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";

export function useNewPrincipalTokensPendingTransaction():
  | PendingTransactionPref
  | undefined {
  const pendingTransaction = usePendingTransaction();

  const { contractAddress, methodName, callArgs } = pendingTransaction;
  // no pending transactions
  if (!contractAddress || !methodName) {
    return;
  }

  // minting new pts and yts
  if (
    contractAddress === ContractAddresses.userProxyContractAddress &&
    methodName === "mint"
  ) {
    return pendingTransaction;
  }

  // swaps for pts
  if (
    contractAddress === ContractAddresses.balancerVaultAddress &&
    methodName === "batchSwap"
  ) {
    const [, , assets] = callArgs as ContractMethodArgs<Vault, "batchSwap">;
    const isPT = !!assets.find(
      (address) => !!TokenMetadata[address]?.tags?.includes("eP")
    );
    if (isPT) {
      return pendingTransaction;
    }
  }

  return;
}
