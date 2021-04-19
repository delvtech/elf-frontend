import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useTrancheUnlockTimestampMulti(
  allTranches: Tranche[]
): QueryObserverResult<BigNumber>[] {
  return useSmartContractReadCalls(allTranches, "unlockTimestamp", {
    staleTime: Infinity,
  });
}
