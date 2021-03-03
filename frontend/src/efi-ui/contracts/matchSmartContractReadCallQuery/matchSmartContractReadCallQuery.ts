import isEqual from "lodash.isequal";

import { makeSmartContractReadCallQueryKey } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { Query } from "react-query";
import { Contract } from "@ethersproject/contracts";
import { ContractMethodName } from "efi/contracts/types";

/**
 * Utility for matching smart contract read call queries when busting the cache.
 */
export function matchSmartContractReadCallQuery<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  query: Query,
  contract: TContract | undefined,
  methodName: TMethodName,
  callArgs: Parameters<TContract["functions"][TMethodName]> | undefined
): boolean {
  const match = isEqual(
    query.queryKey,
    makeSmartContractReadCallQueryKey(contract, methodName, callArgs)
  );
  return match;
}
