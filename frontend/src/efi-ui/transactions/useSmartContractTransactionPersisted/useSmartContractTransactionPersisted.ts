import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Contract, ContractTransaction, Signer } from "ethers";

import {
  useSmartContractTransaction,
  UseSmartContractTransactionOptions,
} from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { usePendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";
import { ContractMethodArgs, ContractMethodName } from "efi/contracts/types";

interface UseSmartContractTransactionWithPrefOptions {
  confirmations?: number;
  onSuccess?: (result: ContractTransaction) => void | Promise<void>;
  onError?: (Error: Error) => void | Promise<void>;
}

/**
 * A thin wrapper around useSmartContractTransaction that persists the transaction hash to user prefs.
 * @param contract
 * @param methodName
 * @param signer
 * @param options
 * @returns
 */
export function useSmartContractTransactionPersisted<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  signer: Signer | undefined,
  options: UseSmartContractTransactionWithPrefOptions = {}
): UseMutationResult<
  ContractTransaction | undefined,
  unknown,
  ContractMethodArgs<TContract, TMethodName>
> {
  const {
    onSuccess: onSuccessFromOptions,
    onError: onErrorFromProps,
  } = options;
  const { setTransaction } = usePendingTransactionPref();

  const onSuccess = useCallback(
    (txReceipt: ContractTransaction) => {
      setTransaction(txReceipt.hash);
      onSuccessFromOptions?.(txReceipt);
    },
    [onSuccessFromOptions, setTransaction]
  );
  const onError = useCallback(
    (error: Error) => {
      setTransaction(undefined);
      onErrorFromProps?.(error);
    },
    [onErrorFromProps, setTransaction]
  );

  const finalOptions: UseSmartContractTransactionOptions = {
    ...options,
    onSuccess,
    onError,
  };

  return useSmartContractTransaction(
    contract,
    methodName,
    signer,
    finalOptions
  );
}
