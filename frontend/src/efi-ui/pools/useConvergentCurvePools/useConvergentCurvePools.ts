import { useMemo } from "react";

import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { ConvergentPoolFactory__factory } from "elf-contracts/types/factories/ConvergentPoolFactory__factory";
import { Signer } from "ethers";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import ContractAddresses, { safeList } from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

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
    "CCPoolCreated",
    { callArgs: [null, null] }
  );

  const convergentPoolContracts = useMemo(
    () =>
      events
        ?.map<ConvergentCurvePool | undefined>((event) =>
          getSmartContractFromRegistry(
            event.args?.pool,
            ConvergentCurvePool__factory.connect,
            signerOrProvider ?? jsonRpcProvider
          )
        )
        .filter(
          (pool): pool is ConvergentCurvePool =>
            !!pool && safeList.includes(pool.address)
        ) || EMPTY_ARRAY,
    [events, signerOrProvider]
  );

  return convergentPoolContracts;
}
