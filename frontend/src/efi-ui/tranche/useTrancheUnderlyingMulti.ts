import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useTrancheUnderlyingMulti(
  tranches: (Tranche | undefined)[]
): QueryObserverResult<string>[] {
  return useSmartContractReadCalls(tranches, "underlying", {
    staleTime: Infinity,
  });
}
