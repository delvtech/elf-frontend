import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import ContractAddresses from "efi/addresses";
import { useBlockFromTag } from "efi-ui/provider/useBlockFromTag/useBlockFromTag";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

const { trancheFactoryAddress } = ContractAddresses;

export function useTrancheCreatedAt(
  tranche: Tranche | undefined
): number | undefined {
  const trancheFactoryContract = getSmartContractFromRegistry(
    trancheFactoryAddress,
    TrancheFactory__factory.connect
  );

  const { data: events } = useSmartContractEvents(
    trancheFactoryContract,
    "TrancheCreated",
    { callArgs: [tranche?.address as string, null, null], enabled: !!tranche }
  );
  const blockNumber = events?.[0].blockNumber;

  const { data: block } = useBlockFromTag(blockNumber);

  if (!block) {
    return;
  }

  return +block.timestamp;
}
