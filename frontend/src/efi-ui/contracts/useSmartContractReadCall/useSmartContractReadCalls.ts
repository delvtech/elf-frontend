import { QueryObserverResult, useQueries, UseQueryOptions } from "react-query";

import { Contract } from "ethers";

import { makeSmartContractReadCallUseQueryOptions } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { Unpacked } from "efi/base/Unpacked";
import {
  ContractMethodArgs,
  ContractMethodName,
  ContractReturnType,
} from "efi/contracts/types";

interface UseSmartContractReadCallsOptions<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> {
  callArgs?: ContractMethodArgs<TContract, TMethodName>;
  enabled?: boolean;
}

/**
 * A hook for calling the same method on a list of contracts.
 *
 * Example:
 *
 * const contracts = [wethContract, usdcContract];
 * const [{ data: wethSymbol }, { data: usdcSymbol }] = useSmartContractReadCalls(
 *   contracts,
 *   "symbol"
 * );
 */
export function useSmartContractReadCalls<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>,
  TReturnType extends Unpacked<ContractReturnType<TContract, TMethodName>>
>(
  contracts: (TContract | undefined)[],
  methodName: TMethodName,
  options?: UseSmartContractReadCallsOptions<TContract, TMethodName>
): QueryObserverResult<TReturnType>[] {
  const queryOptions = contracts.map((contract) =>
    makeSmartContractReadCallUseQueryOptions<
      TContract,
      TMethodName,
      TReturnType
    >(contract, methodName, options)
  );

  // Cast this to unkown when calling useQueries, because useQueries does not
  // yet support generics and string and unknown are incompatible types.
  const queryResult = useQueries(
    queryOptions as UseQueryOptions<unknown, unknown, unknown>[]
  ) as QueryObserverResult<TReturnType, unknown>[];

  return queryResult;
}
