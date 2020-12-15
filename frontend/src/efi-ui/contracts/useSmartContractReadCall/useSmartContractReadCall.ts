import { QueryResult, useQuery } from "react-query";
import { Contract } from "ethers";
import {
  ContractMethodName,
  ContractMethodArgs,
  ContractReturnType,
} from "efi/contracts/types";
import { Unpacked } from "efi/base/Unpacked";

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
  contract: TContract,
  methodName: TMethodName,
  options?: UseSmartContractReadCallOptions<TContract, TMethodName>
): QueryResult<TReturnType> {
  const { enabled = true, callArgs } = options || {};

  const queryKey = makeSmartContractReadCallQueryKey<TContract, TMethodName>(
    contract,
    methodName,
    callArgs
  );

  const queryFn = async (
    key: string,
    { methodName, callArgs: args }: SmartContractReadCallVariables
  ): Promise<TReturnType> => {
    const finalArgs = args || [];
    const result = await contract.functions[methodName](...finalArgs);
    return result;
  };

  const queryResult = useQuery<TReturnType>({
    queryKey,
    queryFn,
    config: { enabled },
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
