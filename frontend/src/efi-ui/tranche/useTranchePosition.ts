import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useTranchePosition(
  tranche: Tranche | undefined
): QueryObserverResult<string> {
  return useSmartContractReadCall(tranche, "position", {
    staleTime: Infinity,
  });
}
