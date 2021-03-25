import { useQuery } from "react-query";

import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentPoolFactory } from "elf-contracts/types/ConvergentPoolFactory";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { ConvergentPoolFactory__factory } from "elf-contracts/types/factories/ConvergentPoolFactory__factory";
import { Signer } from "ethers";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useConvergentCurvePools(
  signerOrProvider: Signer | Provider | undefined
): (ConvergentCurvePool | undefined)[] {
  const { convergentPoolFactoryAddress } = ContractAddresses;

  // First get ConvergentCurvePools (Principal Token Pools)
  const convergentPoolFactory: ConvergentPoolFactory = ConvergentPoolFactory__factory.connect(
    convergentPoolFactoryAddress,
    signerOrProvider ?? jsonRpcProvider
  );

  const eventsQueryResult = useQuery({
    queryKey: [["convergentPoolFactory", "queryFilter", "PoolRegistered"]],
    queryFn: async () => {
      const filterQuery = convergentPoolFactory.filters.PoolRegistered(null);
      const events = await convergentPoolFactory.queryFilter(filterQuery);
      return events;
    },
  });

  const { data: convergentEvents } = eventsQueryResult;

  const convergentPoolContracts =
    convergentEvents?.map<ConvergentCurvePool>((event) =>
      ConvergentCurvePool__factory.connect(
        event.args?.pool,
        signerOrProvider ?? jsonRpcProvider
      )
    ) || [];

  return convergentPoolContracts;
}
