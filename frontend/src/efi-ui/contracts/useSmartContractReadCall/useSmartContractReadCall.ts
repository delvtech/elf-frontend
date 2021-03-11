import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query";

import { Contract } from "ethers";

import { Unpacked } from "efi/base/Unpacked";
import {
  ContractMethodArgs,
  ContractMethodName,
  StaticContractReturnType,
} from "efi/contracts/types";

export interface UseSmartContractReadCallOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  callArgs?: ContractMethodArgs<TContract, TMethodName>;
  enabled?: boolean;
}

export function useSmartContractReadCall<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>,
  TReturnType extends Unpacked<StaticContractReturnType<TContract, TMethodName>>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  options?: UseSmartContractReadCallOptions<TContract, TMethodName>
): QueryObserverResult<TReturnType> {
  const queryOptions = makeSmartContractReadCallUseQueryOptions<
    TContract,
    TMethodName,
    TReturnType
  >(contract, methodName, options);

  const queryResult = useQuery(queryOptions);

  return queryResult;
}

export function makeSmartContractReadCallUseQueryOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>,
  TReturnType extends Unpacked<StaticContractReturnType<TContract, TMethodName>>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  options?: UseSmartContractReadCallOptions<TContract, TMethodName>
): UseQueryOptions<TReturnType> {
  const { enabled = true, callArgs } = options || {};

  const queryKey = makeSmartContractReadCallQueryKey<TContract, TMethodName>(
    contract,
    methodName,
    callArgs
  );

  const queryFn = async (): Promise<TReturnType> => {
    const finalArgs = callArgs || [];
    // Read calls are by definition static, so we make sure to call the static method explicitly
    const result = await contract?.callStatic?.[methodName as string](
      ...finalArgs
    );
    return result;
  };

  return {
    queryKey,
    queryFn,
    onError: () => {
      console.error(
        `Error calling ${methodName} on contract: ${contract?.address}`
      );
    },
    enabled: !!contract && enabled,
  };
}

export function makeSmartContractReadCallQueryKey<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract | undefined,
  methodName: TMethodName,
  callArgs: Parameters<TContract["functions"][TMethodName]> | undefined
): [
  [string, string | undefined],
  {
    methodName: TMethodName;
    callArgs: Parameters<TContract["functions"][TMethodName]> | undefined;
  }
] {
  return [["contractCall", contract?.address], { methodName, callArgs }];
}
