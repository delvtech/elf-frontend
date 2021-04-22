import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { ConvergentPoolFactory__factory } from "elf-contracts/types/factories/ConvergentPoolFactory__factory";
import { Signer } from "ethers";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { getSmartContractFromRegistry } from "efi-ui/contracts/SmartContractsRegistry";
import { useMemo } from "react";

const { convergentPoolFactoryAddress } = ContractAddresses;
const EMPTY_ARRAY: (ConvergentCurvePool | undefined)[] = [];
export function useConvergentCurvePools(
  signerOrProvider?: Signer | Provider
): (ConvergentCurvePool | undefined)[] {
  const convergentPoolFactory = getSmartContractFromRegistry(
    convergentPoolFactoryAddress,
    ConvergentPoolFactory__factory.connect,
    signerOrProvider
  );

  const { data: events } = useSmartContractEvents(
    convergentPoolFactory,
    "PoolRegistered",
    { callArgs: [null] }
  );

  const convergentPoolContracts = useMemo(
    () =>
      events?.map<ConvergentCurvePool | undefined>((event) =>
        getSmartContractFromRegistry(
          event.args?.pool,
          ConvergentCurvePool__factory.connect,
          signerOrProvider ?? jsonRpcProvider
        )
      ) || EMPTY_ARRAY,
    [events, signerOrProvider]
  );

  return convergentPoolContracts;
}
