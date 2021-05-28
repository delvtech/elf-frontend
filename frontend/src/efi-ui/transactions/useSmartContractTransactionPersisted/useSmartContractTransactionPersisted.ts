import { useCallback } from "react";
import { UseMutationResult, useQueryClient } from "react-query";

import { Contract, ContractTransaction, Signer } from "ethers";

import {
  useSmartContractTransaction,
  UseSmartContractTransactionOptions,
} from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ContractMethodArgs, ContractMethodName } from "efi/contracts/types";
import { ETH_BALANCE_QUERY_KEY } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";

interface UseSmartContractTransactionPersistedOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  confirmations?: number;
  onTransactionStarted?: (
    result: ContractTransaction,
    callArgs: ContractMethodArgs<TContract, TMethodName>
  ) => void | Promise<void>;
  onTransactionSuccess?: (
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
  const queryClient = useQueryClient();
  const {
    onTransactionStarted,
    onTransactionSuccess,
    onError: onErrorFromProps,
  } = options;
  const { setPendingTransactionPref, clearPendingTransactionPref } =
    usePendingTransactionPref();

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
      onTransactionStarted?.(txReceipt, callArgs);
    },
    [
      contract?.address,
      methodName,
      onTransactionStarted,
      setPendingTransactionPref,
    ]
  );

  const onSuccess = useCallback(
    (
      txReceipt: ContractTransaction,
      callArgs: ContractMethodArgs<TContract, TMethodName>
    ) => {
      clearPendingTransactionPref();
      // This ensures that balances refresh when a tx completes. In general,
      // all txs should invalidate all balances.
      queryClient.invalidateQueries(ETH_BALANCE_QUERY_KEY);
      queryClient.invalidateQueries(["contractCall", "balanceOf"]);
      onTransactionSuccess?.(txReceipt, callArgs);
    },
    [clearPendingTransactionPref, onTransactionSuccess, queryClient]
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
