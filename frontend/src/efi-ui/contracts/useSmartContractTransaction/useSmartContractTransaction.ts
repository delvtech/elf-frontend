import { Contract, ContractTransaction, Signer } from "ethers";

import { useMutation, UseMutationResult } from "react-query";
import { ContractMethodArgs, ContractMethodName } from "efi/contracts/types";
import { lookupAddressKey } from "efi/contracts/contractsJson";

export interface UseSmartContractTransactionOptions {
  confirmations?: number;
  onSuccess?: (result: ContractTransaction) => void | Promise<void>;
  onError?: (result: Error) => void | Promise<void>;
}
export function useSmartContractTransaction<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  signer: Signer | undefined,
  options: UseSmartContractTransactionOptions = {}
): UseMutationResult<
  ContractTransaction | undefined,
  unknown,
  ContractMethodArgs<TContract, TMethodName>
> {
  const { confirmations = 1, onSuccess, onError } = options;
  return useMutation(
    async (args: ContractMethodArgs<TContract, TMethodName>) => {
      if (!signer || !contract) {
        console.warn(
          `Attempted to call ${methodName} without a signer or contract instance.`
        );
        return;
      }

      const connected = (await contract.connect(signer)) as TContract;
      return connected[methodName](...args);
    },
    {
      onError: async (error: Error) => {
        const addressesJsonKey = lookupAddressKey(contract?.address);
        console.error(
          `Error calling ${methodName} on ${addressesJsonKey}: ${contract?.address} with arguments:`,
          error
        );
        await onError?.(error);
      },

      onSuccess: async (txReceipt) => {
        await txReceipt?.wait(confirmations);
        await onSuccess?.(txReceipt);
      },
    }
  );
}
