import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractQuery } from "efi-ui/contracts/useSmartContractQuery/useSmartContractQuery";
import ContractAddresses from "efi/contracts/contractsJson";
import { useBlockFromTag } from "efi-ui/provider/useBlockFromTag/useBlockFromTag";

const { trancheFactoryAddress } = ContractAddresses;

export function useTrancheCreatedAt(
  tranche: Tranche | undefined
): number | undefined {
  const trancheFactoryContract = useSmartContractFromFactory(
    trancheFactoryAddress,
    TrancheFactory__factory.connect
  );

  const { data: events } = useSmartContractQuery(
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
