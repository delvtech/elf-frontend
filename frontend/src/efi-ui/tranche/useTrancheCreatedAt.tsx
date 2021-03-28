import { QueryObserverResult, useQuery } from "react-query";
import { Provider } from "@ethersproject/abstract-provider";
import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { TrancheFactory } from "elf-contracts/types/TrancheFactory";
import { Signer } from "ethers";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

const { trancheFactoryAddress } = ContractAddresses;

export function useTrancheCreatedAt(
  tranche: Tranche | undefined,
  signerOrProvider?: Signer | Provider
): QueryObserverResult<number> {
  const trancheFactoryContract = TrancheFactory__factory.connect(
    trancheFactoryAddress,
    signerOrProvider ?? jsonRpcProvider
  );

  const filterOptions: Parameters<
    TrancheFactory["filters"]["TrancheCreated"]
  > = [tranche?.address ?? null, null, null];
  const filterQuery = trancheFactoryContract.filters.TrancheCreated(
    ...filterOptions
  );

  const queryResult = useQuery<number>({
    queryKey: [
      ["trancheFactory", "queryFilter", "TrancheCreated"],
      { filterOptions },
    ],
    queryFn: async () => {
      const events = await trancheFactoryContract.queryFilter(filterQuery);
      const block = await jsonRpcProvider.getBlock(events?.[0].blockNumber);
      return block.timestamp;
    },
  });
  return queryResult;
}
