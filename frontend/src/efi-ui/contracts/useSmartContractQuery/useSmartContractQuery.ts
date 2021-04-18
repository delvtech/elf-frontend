import { QueryObserverResult, useQuery, UseQueryOptions } from "react-query";

import { Contract, Event } from "ethers";

import { lookupAddressKey } from "efi/contracts/contractsJson";
import { ContractFilterArgs, ContractFilterName } from "efi/contracts/types";

export interface UseSmartContractQueryCallOptions<
  TContract extends Contract,
  TFilterName extends ContractFilterName<TContract>
> {
  callArgs?: ContractFilterArgs<TContract, TFilterName>;
  enabled?: boolean;
  fromBlock?: number;
  toBlock?: number;
}

export function useSmartContractQuery<
  TContract extends Contract,
  TFilterName extends ContractFilterName<TContract>
>(
  contract: TContract | undefined,
  filterName: TFilterName,
  options?: UseSmartContractQueryCallOptions<TContract, TFilterName>
): QueryObserverResult<Event[]> {
  const queryOptions = makeSmartContractQueryUseQueryOptions<
    TContract,
    TFilterName
  >(contract, filterName, options);

  const queryResult = useQuery(queryOptions);

  return queryResult;
}

export function makeSmartContractQueryUseQueryOptions<
  TContract extends Contract,
  TFilterName extends ContractFilterName<TContract>
>(
  contract: TContract | undefined,
  filterName: TFilterName,
  options?: UseSmartContractQueryCallOptions<TContract, TFilterName>
): UseQueryOptions<Event[]> {
  const { enabled = true, callArgs, fromBlock, toBlock } = options || {};

  const queryKey = makeSmartContractQueryQueryKey<TContract, TFilterName>(
    contract,
    filterName,
    callArgs
  );

  const queryFn = async (): Promise<Event[]> => {
    // this function is not called until contract is defined, so safe to cast.
    const _contract = contract as TContract;

    const finalArgs = callArgs || [];
    const eventFilter = _contract.filters[filterName as string](...finalArgs);
    const result = await _contract.queryFilter(eventFilter, fromBlock, toBlock);
    return result;
  };

  return {
    queryKey,
    queryFn,
    onError: () => {
      const addressesJsonKey = lookupAddressKey(contract?.address);
      console.error(
        `Error calling ${filterName} on ${addressesJsonKey}: ${contract?.address} with arguments:`,
        callArgs
      );
    },
    enabled: !!contract && enabled,
  };
}

export function makeSmartContractQueryQueryKey<
  TContract extends Contract,
  TFilterName extends ContractFilterName<TContract>
>(
  contract: TContract | undefined,
  filterName: TFilterName,
  callArgs: Parameters<TContract["filters"][TFilterName]> | undefined
): [
  [string, string | undefined],
  {
    filterName: TFilterName;
    callArgs: Parameters<TContract["filters"][TFilterName]> | undefined;
  }
] {
  return [["contractQueryFilter", contract?.address], { filterName, callArgs }];
}
