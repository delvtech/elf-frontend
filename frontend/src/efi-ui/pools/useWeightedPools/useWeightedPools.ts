import { Provider } from "@ethersproject/providers";
import { WeightedPool__factory } from "elf-contracts/types/factories/WeightedPool__factory";
import { WeightedPoolFactory__factory } from "elf-contracts/types/factories/WeightedPoolFactory__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import ContractAddresses from "efi/addresses";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useWeightedPools(
  signerOrProvider?: Signer | Provider
): (WeightedPool | undefined)[] {
  const { weightedPoolFactoryAddress } = ContractAddresses;

  const convergentPoolFactory = useSmartContractFromFactory(
    weightedPoolFactoryAddress,
    WeightedPoolFactory__factory.connect
  );

  const { data: events } = useSmartContractEvents(
    convergentPoolFactory,
    "PoolCreated",
    { callArgs: [null] }
  );

  const weightedPoolContracts =
    events?.map<WeightedPool>((event) =>
      WeightedPool__factory.connect(
        event.args?.pool,
        signerOrProvider ?? jsonRpcProvider
      )
    ) || [];

  return weightedPoolContracts;
}
