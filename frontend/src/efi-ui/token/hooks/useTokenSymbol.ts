import { ERC20 } from "elf-contracts/types/ERC20";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { QueryObserverResult } from "react-query";

export function useTokenSymbol<TContract extends ERC20>(
  contract: TContract | undefined
): QueryObserverResult<string> {
  return useSmartContractReadCall(contract, "symbol", {
    infiniteCache: true,
  });
}
