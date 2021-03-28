import { useQuery } from "react-query";

import { Provider } from "@ethersproject/providers";
import { WeightedPool__factory } from "elf-contracts/types/factories/WeightedPool__factory";
import { WeightedPoolFactory__factory } from "elf-contracts/types/factories/WeightedPoolFactory__factory";
import { Signer } from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { WeightedPool } from "elf-contracts/types/WeightedPool";

export function useWeightedPools(
  signerOrProvider?: Signer | Provider
): (WeightedPool | undefined)[] {
  const { weightedPoolFactoryAddress } = ContractAddresses;

  const weightedPoolFactory = WeightedPoolFactory__factory.connect(
    weightedPoolFactoryAddress,
    signerOrProvider ?? jsonRpcProvider
  );

  const weightedQueryResult = useQuery({
    queryKey: [["weightedPoolFactory", "queryFilter", "PoolRegistered"]],
    queryFn: async () => {
      const filterQuery = weightedPoolFactory.filters.PoolRegistered(null);
      const events = await weightedPoolFactory.queryFilter(filterQuery);
      return events;
    },
  });

  const { data: weightedEvents } = weightedQueryResult;

  const weightedPoolContracts =
    weightedEvents?.map<WeightedPool>((event) =>
      WeightedPool__factory.connect(
        event.args?.pool,
        signerOrProvider ?? jsonRpcProvider
      )
    ) || [];

  return weightedPoolContracts;
}
