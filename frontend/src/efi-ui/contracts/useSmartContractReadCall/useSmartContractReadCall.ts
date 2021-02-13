import { Contract } from "ethers";
import { QueryObserverResult, useQuery } from "react-query";

import { Unpacked } from "efi/base/Unpacked";
import {
  ContractMethodArgs,
  ContractMethodName,
  ContractReturnType,
} from "efi/contracts/types";

interface UseSmartContractReadCallOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  callArgs?: ContractMethodArgs<TContract, TMethodName>;
  enabled?: boolean;
}

export function useSmartContractReadCall<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>,
  TReturnType extends Unpacked<ContractReturnType<TContract, TMethodName>>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  options?: UseSmartContractReadCallOptions<TContract, TMethodName>
): QueryObserverResult<TReturnType> {
  const { enabled = true, callArgs } = options || {};

  const queryKey = makeSmartContractReadCallQueryKey<TContract, TMethodName>(
    contract,
    methodName,
    callArgs
  );

  const queryFn = async (): Promise<TReturnType> => {
    const finalArgs = callArgs || [];
    const result = await contract?.[methodName as string](...finalArgs);
    return result;
  };

  const queryResult = useQuery<TReturnType>({
    queryKey,
    queryFn,
    enabled: !!contract && enabled,
  });

  return queryResult;
}

function makeSmartContractReadCallQueryKey<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  callArgs: Parameters<TContract["functions"][TMethodName]> | undefined
) {
  return [["contractCall", contract?.address], { methodName, callArgs }];
}
