import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Contract, ContractTransaction, Signer } from "ethers";

import {
  useSmartContractTransaction,
  UseSmartContractTransactionOptions,
} from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ContractMethodArgs, ContractMethodName } from "efi/contracts/types";

interface UseSmartContractTransactionPersistedOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  confirmations?: number;
  onSuccess?: (
    result: ContractTransaction,
    callArgs: ContractMethodArgs<TContract, TMethodName>
  ) => void | Promise<void>;
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
  options: UseSmartContractTransactionPersistedOptions<
    TContract,
    TMethodName
  > = {}
): UseMutationResult<
  ContractTransaction | undefined,
  unknown,
  ContractMethodArgs<TContract, TMethodName>
> {
  const {
    onSuccess: onSuccessFromOptions,
    onError: onErrorFromProps,
  } = options;
  const {
    setPendingTransactionPref,
    clearPendingTransactionPref,
  } = usePendingTransactionPref();

  const onBeginTransaction = useCallback(
    (
      txReceipt: ContractTransaction,
      callArgs: ContractMethodArgs<TContract, TMethodName>
    ) => {
      setPendingTransactionPref(
        contract?.address,
        methodName as string,
        callArgs,
        txReceipt.hash
      );
      onSuccessFromOptions?.(txReceipt, callArgs);
    },
    [
      contract?.address,
      methodName,
      onSuccessFromOptions,
      setPendingTransactionPref,
    ]
  );

  const onSuccess = useCallback(
    (
      txReceipt: ContractTransaction,
      callArgs: ContractMethodArgs<TContract, TMethodName>
    ) => {
      clearPendingTransactionPref();
      onSuccessFromOptions?.(txReceipt, callArgs);
    },
    [clearPendingTransactionPref, onSuccessFromOptions]
  );

  const onError = useCallback(
    (error: Error) => {
      clearPendingTransactionPref();
      onErrorFromProps?.(error);
    },
    [clearPendingTransactionPref, onErrorFromProps]
  );

  const finalOptions: UseSmartContractTransactionOptions<
    TContract,
    TMethodName
  > = {
    ...options,
    onBeginTransaction,
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
