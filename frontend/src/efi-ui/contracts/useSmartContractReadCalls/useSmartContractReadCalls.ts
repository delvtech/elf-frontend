import { QueryObserverResult, useQueries, UseQueryOptions } from "react-query";

import { Contract } from "ethers";

import { Unpacked } from "efi/base/Unpacked";
import {
  ContractMethodArgs,
  ContractMethodName,
  ContractReturnType,
} from "efi/contracts/types";
import zip from "lodash.zip";
import { makeSmartContractReadCallUseQueryOptions } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import isPlainObject from "lodash.isplainobject";

export interface UseSmartContractReadCallsOptions<
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
 *
 * Example with call args:
 *
 * const [
 *   { data: wethMarket },
 *   { data: usdcMarket },
 * ] = useSmartContractReadCalls(contracts, "getSpotPrice", [
 *   { callArgs: ["0xSomeToken"] },
 *   { callArgs: ["0xAnotherToken"] },
 * ]);
 */
export function useSmartContractReadCalls<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>,
  TReturnType extends Unpacked<ContractReturnType<TContract, TMethodName>>
>(
  contracts: (TContract | undefined)[],
  methodName: TMethodName,
  options?:
    | (UseSmartContractReadCallsOptions<TContract, TMethodName> | undefined)[]
    | UseSmartContractReadCallsOptions<TContract, TMethodName>
): QueryObserverResult<TReturnType>[] {
  let optionsArray: (
    | UseSmartContractReadCallsOptions<TContract, TMethodName>
    | undefined
  )[] = [];

  if (!options || isPlainObject(options)) {
    optionsArray = contracts.map(() => options) as (
      | UseSmartContractReadCallsOptions<TContract, TMethodName>
      | undefined
    )[];
  } else if (options && Array.isArray(options)) {
    optionsArray = options;
  }

  const queryOptions = zip(contracts, optionsArray).map(([contract, options]) =>
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
