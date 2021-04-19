import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

export function useTokenDecimals(
  contract: ERC20 | ERC20Permit | undefined
): QueryObserverResult<number> {
  return useSmartContractReadCall(contract, "decimals", {
    staleTime: Infinity,
  });
}
