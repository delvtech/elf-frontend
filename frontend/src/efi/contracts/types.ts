import { Contract } from "ethers";

export type ContractCall<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> = TContract[TMethodName];
/**
 * Gets a type for the specific contract call
 */
export type ContractFunctionCall<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> = TContract["functions"][TMethodName];

/**
 * Gets a type for the methods available on a given contract
 */
export type ContractMethodName<
  TContract extends Contract
> = keyof TContract["functions"];

/**
 * Gets a type for the return type of the given contract call
 */
export type ContractReturnType<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> = ReturnType<ContractCall<TContract, TMethodName>>;

/**
 * Gets a type for the call arguments of a given contract and method name
 */
export type ContractMethodArgs<
  TContract extends Contract,
  TMethodName extends ContractMethodName<TContract>
> = Parameters<ContractFunctionCall<TContract, TMethodName>>;
