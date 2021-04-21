import { useCallback } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber, Signer } from "ethers";

import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { ContractMethodArgs } from "efi/contracts/types";

export function useWithdrawInterest(
  signer: Signer | undefined,
  tranche: Tranche | undefined,
  account: string | null | undefined,
  amount: BigNumber | undefined
): () => void {
  const withdrawInterestCallArgs = makeWithdrawInterestCallArgs(
    account,
    amount
  );

  const { mutate: withdrawInterest } = useSmartContractTransactionPersisted(
    tranche,
    "withdrawInterest",
    signer
  );

  return useCallback(() => {
    if (!withdrawInterestCallArgs) {
      return;
    }
    withdrawInterest(withdrawInterestCallArgs);
  }, [withdrawInterest, withdrawInterestCallArgs]);
}

function makeWithdrawInterestCallArgs(
  account: string | null | undefined,
  amount: BigNumber | undefined
): ContractMethodArgs<Tranche, "withdrawInterest"> | undefined {
  if (!amount?.gt(0) || !account) {
    return undefined;
  }

  const callArgs: ContractMethodArgs<Tranche, "withdrawInterest"> = [
    amount,
    account,
  ];

  return callArgs;
}
