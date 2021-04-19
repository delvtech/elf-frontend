import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTokenDecimals(
  contract: ERC20 | undefined
): QueryObserverResult<number> {
  return useSmartContractReadCall(contract, "decimals", {
    infiniteCache: true,
  });
}
