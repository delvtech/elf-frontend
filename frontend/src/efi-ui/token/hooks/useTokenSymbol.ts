import { ERC20 } from "elf-contracts/types/ERC20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { QueryObserverResult } from "react-query";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";

export function useTokenSymbol(
  contract: ERC20 | ERC20Permit | undefined
): QueryObserverResult<string> {
  return useSmartContractReadCall(contract, "symbol", {
    infiniteCache: true,
  });
}
