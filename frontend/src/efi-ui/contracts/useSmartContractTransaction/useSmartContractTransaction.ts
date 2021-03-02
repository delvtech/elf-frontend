import { Contract, ContractTransaction, Signer } from "ethers";

import { useMutation, UseMutationResult } from "react-query";
import { ContractMethodArgs, ContractMethodName } from "efi/contracts/types";

interface UseSmartContractTransactionOptions {
  confirmations?: number;
  onSuccess?: (result: ContractTransaction) => void | Promise<void>;
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
  const { confirmations = 1, onSuccess } = options;
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
      onSuccess: async (txReceipt) => {
        await txReceipt?.wait(confirmations);
        await onSuccess?.(txReceipt);
      },
    }
  );
}
