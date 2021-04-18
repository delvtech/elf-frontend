import { QueryObserverResult, useQuery } from "react-query";

import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractQuery } from "efi-ui/contracts/useSmartContractQuery/useSmartContractQuery";
import ContractAddresses from "efi/contracts/contractsJson";
import { Block } from "efi/crypto/fetchEthBlocks";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

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

  const { data: block } = useBlock(blockNumber);

  if (!block) {
    return;
  }

  return +block.timestamp;
}

// TODO: generalize to make a useProviderCall just like we have useSmartContractReadCall
/**
 * returns a block for a given block number
 * @param {number} blockNumber integer block number
 * @returns {Block}
 */
export function useBlock(
  blockNumber: number | undefined
): QueryObserverResult<Block> {
  if (!Number.isInteger(blockNumber)) {
    console.error("Error using useBlock: blockNumber must be an integer");
  }

  const queryResult = useQuery({
    queryKey: [["provider", "getBlock"], { blockNumber }],
    queryFn: async () => {
      return jsonRpcProvider.getBlock(blockNumber as number);
    },
    enabled: blockNumber !== undefined && Number.isInteger(blockNumber),
  }) as QueryObserverResult<Block>;

  return queryResult;
}
