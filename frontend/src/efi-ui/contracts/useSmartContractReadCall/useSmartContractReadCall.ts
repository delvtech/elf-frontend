import { QueryResult, useQuery } from "react-query";
import { Contract } from "ethers";
import {
  ContractMethodName,
  ContractMethodArgs,
  ContractReturnType,
} from "efi/contracts/types";

export function useSmartContractReadCall<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract,
  methodName: TMethodName,
  callArgs?: ContractMethodArgs<TContract, TMethodName>
): QueryResult<ContractReturnType<TContract, TMethodName>> {
  const queryKey = makeSmartContractReadCallQueryKey<TContract, TMethodName>(
    contract,
    methodName,
    callArgs
  );

  const queryFn = async (
    key: string,
    { methodName, callArgs: args }: SmartContractReadCallVariables
  ) => {
    const finalArgs = args || [];
    const result = await contract.functions[methodName](finalArgs);
    return result;
  };

  const queryResult = useQuery<ContractReturnType<TContract, TMethodName>>({
    queryKey,
    queryFn,
  });

  return queryResult;
}

interface SmartContractReadCallVariables {
  methodName: string;
  callArgs?: any[];
}

function makeSmartContractReadCallQueryKey<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
>(
  contract: TContract,
  methodName: TMethodName,
  callArgs: Parameters<TContract["functions"][TMethodName]> | undefined
) {
  return [["contractCall", contract.address], { methodName, callArgs }];
}
