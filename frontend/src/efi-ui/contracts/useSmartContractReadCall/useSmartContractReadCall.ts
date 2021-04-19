import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query";

import { Contract } from "ethers";

import { Unpacked } from "efi/base/Unpacked";
import {
  ContractMethodArgs,
  ContractMethodName,
  StaticContractReturnType,
} from "efi/contracts/types";
import { lookupAddressKey } from "efi/contracts/contractsJson";

export interface UseSmartContractReadCallOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  callArgs?: ContractMethodArgs<TContract, TMethodName>;
  enabled?: boolean;

  infiniteCache?: boolean;
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
  const queryOptions = makeSmartContractReadCallUseQueryOptions(
    contract,
    methodName,
    options
  );

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
  const { enabled = true, callArgs, infiniteCache = false } = options || {};

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

  const queryOptions: UseQueryOptions<TReturnType> = {
    queryKey,
    queryFn,
    onError: () => {
      const addressesJsonKey = lookupAddressKey(contract?.address);
      console.error(
        `Error calling ${methodName} on ${addressesJsonKey}: ${contract?.address} with arguments:`,
        callArgs
      );
    },
    enabled: !!contract && enabled,
  };

  if (infiniteCache) {
    queryOptions.staleTime = Infinity;
  }

  return queryOptions;
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
