import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenName(
  tokenContract: ERC20 | ERC20Permit | undefined
): QueryObserverResult<string> {
  return useSmartContractReadCall(tokenContract, "name", {
    infiniteCache: true,
  });
}
