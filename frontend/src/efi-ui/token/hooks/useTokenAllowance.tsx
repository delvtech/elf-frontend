import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { ContractMethodArgs } from "efi/contracts/types";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

export function useTokenAllowance(
  contract: ERC20 | ERC20Permit | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(contract, "allowance", {
    enabled: !!owner && !!spender,
    callArgs: [owner as string, spender as string],
  });
}
export function useTokenAllowanceMulti(
  contracts: (ERC20 | undefined)[],
  owners: (string | null | undefined)[],
  spenders: (string | null | undefined)[]
): QueryObserverResult<BigNumber>[] {
  const callArgs = zip(owners, spenders).map(([owner, spender]) => {
    return {
      enabled: !!owner && !!spender,
      callArgs: [owner as string, spender as string] as ContractMethodArgs<
        ERC20,
        "allowance"
      >,
    };
  });

  return useSmartContractReadCalls(contracts, "allowance", callArgs);
}
