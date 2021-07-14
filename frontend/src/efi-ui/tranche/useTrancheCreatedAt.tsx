import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useBlockFromTag } from "efi-ui/provider/useBlockFromTag/useBlockFromTag";
import { trancheFactoryContract } from "efi/tranche/trancheFactory";

export function useTrancheCreatedAt(
  tranche: Tranche | undefined
): number | undefined {
  const { data: events } = useSmartContractEvents(
    trancheFactoryContract,
    "TrancheCreated",
    {
      callArgs: [tranche?.address as string, null, null],
      enabled: !!tranche,
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const blockNumber = events?.[0].blockNumber;

  const { data: block } = useBlockFromTag(blockNumber);

  if (!block) {
    return;
  }

  return +block.timestamp;
}
