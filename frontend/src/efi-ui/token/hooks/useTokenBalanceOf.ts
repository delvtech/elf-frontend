import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { QueryObserverResult } from "react-query";

export function useTokenBalanceOf(
  contract: ERC20 | undefined,
  address: string | null | undefined
): ComputedQueryResult<BigNumber> {
  const result = useSmartContractReadCall(contract, "balanceOf", {
    callArgs: [address as string], // safe to cast because `enabled` is set
    enabled: !!address,
  });

  return [result.data, [result]];
}

export function useTokenBalanceOfMulti(
  tokenContracts: (ERC20 | undefined)[],
  account: string | null | undefined
): QueryObserverResult<BigNumber>[] {
  return useSmartContractReadCalls(tokenContracts, "balanceOf", {
    callArgs: [account as string],
    enabled: !!account,
  });
}
