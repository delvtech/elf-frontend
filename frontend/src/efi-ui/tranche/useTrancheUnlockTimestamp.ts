import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

/**
 * @deprecated use tokenlist instead
 */
export function useTrancheUnlockTimestamp(
  tranche: Tranche | undefined
): QueryObserverResult<BigNumber> {
  return useSmartContractReadCall(tranche, "unlockTimestamp", {
    staleTime: Infinity,
  });
}
