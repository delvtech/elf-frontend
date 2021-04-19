import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { Tranche } from "elf-contracts/types/Tranche";
import { QueryObserverResult } from "react-query";

export function useTrancheInterestTokenMulti(
  tranches: (Tranche | undefined)[]
): QueryObserverResult<string>[] {
  return useSmartContractReadCalls(tranches, "interestToken", {
    infiniteCache: true,
  });
}
