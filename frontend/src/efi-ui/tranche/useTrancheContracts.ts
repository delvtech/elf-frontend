import { Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { TrancheFactory } from "elf-contracts/types/TrancheFactory";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useQuery } from "react-query";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";

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

  const { data: events = [] } = eventsQueryResult;

  const trancheAddresses = Array.isArray(events)
    ? (events?.map((event) => event.args?.trancheAddress) as (
        | string
        | undefined
      )[])
    : [];

  const trancheContracts = useSmartContractsFromFactory(
    trancheAddresses,
    Tranche__factory.connect,
    signerOrProvider
  );

  const validTranches = trancheContracts.filter(
    (contract): contract is Tranche => !!contract
  );

  if (!validTranches.length) {
    return [];
  }

  return validTranches;
}
