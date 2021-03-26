import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { TrancheFactory } from "elf-contracts/types/TrancheFactory";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useQuery } from "react-query";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";

type TrancheFilterOptions = Parameters<
  TrancheFactory["filters"]["TrancheCreated"]
>;
export function useTrancheContracts(
  signerOrProvider?: Signer | Provider | undefined,
  filterOptions: TrancheFilterOptions = [null, null, null]
): Tranche[] {
  const { trancheFactoryAddress } = ContractAddresses;

  const trancheFactoryContract = TrancheFactory__factory.connect(
    trancheFactoryAddress,
    signerOrProvider ?? jsonRpcProvider
  );

  const filterQuery = trancheFactoryContract.filters.TrancheCreated(
    ...filterOptions
  );

  const eventsQueryResult = useQuery({
    queryKey: [
      ["trancheFactory", "queryFilter", "TrancheCreated"],
      { filterOptions },
    ],
    queryFn: async () => {
      const events = await trancheFactoryContract.queryFilter(filterQuery);
      return events;
    },
  });

  const { data: events } = eventsQueryResult;

  if (!events) {
    return [];
  }

  const trancheContracts: Tranche[] = events.map((event) =>
    Tranche__factory.connect(
      event.args?.trancheAddress,
      signerOrProvider ?? jsonRpcProvider
    )
  );

  return trancheContracts;
}
