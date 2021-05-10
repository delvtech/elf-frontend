import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";

export function useTrancheUnlockTimestamp(
  tranche: Tranche | undefined
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(tranche, "unlockTimestamp", {
    staleTime: Infinity,
  });
}

export function useTrancheUnlockTimestampMulti(
  allTranches: Tranche[]
): QueryObserverResult<BigNumber>[] {
  return useSmartContractReadCalls(allTranches, "unlockTimestamp", {
    staleTime: Infinity,
  });
}
