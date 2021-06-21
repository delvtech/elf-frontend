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
): {
  withdraw: () => void;
  reset: () => void;
  isError: boolean;
  isLoading: boolean;
} {
  const withdrawPrincipalCallArgs = makeWithdrawPrincipalCallArgs(
    account,
    amount
  );

  const {
    mutate: withdrawPrincipal,
    isError,
    isLoading,
    reset,
  } = useSmartContractTransactionPersisted(
    tranche,
    "withdrawPrincipal",
    signer
  );

  const withdraw = useCallback(() => {
    if (!withdrawPrincipalCallArgs) {
      return;
    }
    withdrawPrincipal(withdrawPrincipalCallArgs);
  }, [withdrawPrincipal, withdrawPrincipalCallArgs]);

  return {
    withdraw,
    reset,
    isError,
    isLoading,
  };
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
