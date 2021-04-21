import { useCallback } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";

import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { ContractMethodArgs } from "efi/contracts/types";

export function useWithdrawPrincipal(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  account: string | null | undefined,
  amount: BigNumber | undefined
): () => void {
  const withdrawPrincipalCallArgs = makeWithdrawPrincipalCallArgs(
    account,
    amount
  );

  const { mutate: withdrawPrincipal } = useSmartContractTransactionPersisted(
    tranche,
    "withdrawPrincipal",
    signer
  );

  return useCallback(() => {
    if (!withdrawPrincipalCallArgs) {
      return;
    }
    withdrawPrincipal(withdrawPrincipalCallArgs);
  }, [withdrawPrincipal, withdrawPrincipalCallArgs]);
}

function makeWithdrawPrincipalCallArgs(
  account: string | null | undefined,
  amount: BigNumber | undefined
): ContractMethodArgs<Tranche, "withdrawPrincipal"> | undefined {
  if (!amount?.gt(0) || !account) {
    return undefined;
  }

  const callArgs: ContractMethodArgs<Tranche, "withdrawPrincipal"> = [
    amount,
    account,
  ];

  return callArgs;
}
