import { ConvergentPoolFactory__factory } from "elf-contracts/types/factories/ConvergentPoolFactory__factory";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useBlockFromTag } from "efi-ui/provider/useBlockFromTag/useBlockFromTag";
import ContractAddresses from "efi/addresses";
import { PoolContract } from "efi/pools/PoolContract";
import { WeightedPoolFactory__factory } from "elf-contracts/types/factories/WeightedPoolFactory__factory";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

export function usePoolCreatedAt(
  pool: PoolContract | undefined
): number | undefined {
  const { convergentPoolFactoryAddress } = ContractAddresses;
  const convergentPoolFactory = getSmartContractFromRegistry(
    convergentPoolFactoryAddress,
    ConvergentPoolFactory__factory.connect
  );
  const { data: convergentEvents } = useSmartContractEvents(
    convergentPoolFactory,
    "CCPoolCreated",
    {
      enabled: !!pool?.address,
      callArgs: [pool?.address as string, null],
    }
  );
  const convergentBlockNumber = convergentEvents?.[0]?.blockNumber;
  const { data: convergentBlock } = useBlockFromTag(convergentBlockNumber);

  const { weightedPoolFactoryAddress } = ContractAddresses;
  const weightedPoolFactory = getSmartContractFromRegistry(
    weightedPoolFactoryAddress,
    WeightedPoolFactory__factory.connect
  );
  const { data: weightedEvents } = useSmartContractEvents(
    weightedPoolFactory,
    "PoolCreated",
    { enabled: !!pool?.address, callArgs: [pool?.address as string] }
  );
  const weightedBlockNumber = weightedEvents?.[0]?.blockNumber;
  const { data: weightedBlock } = useBlockFromTag(weightedBlockNumber);

  if (convergentBlock) {
    return +convergentBlock.timestamp;
  }

  if (weightedBlock) {
    return +weightedBlock.timestamp;
  }
}
