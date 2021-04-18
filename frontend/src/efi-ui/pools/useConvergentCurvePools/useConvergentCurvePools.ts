import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { ConvergentCurvePool__factory } from "elf-contracts/types/factories/ConvergentCurvePool__factory";
import { ConvergentPoolFactory__factory } from "elf-contracts/types/factories/ConvergentPoolFactory__factory";
import { Signer } from "ethers";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractQuery } from "efi-ui/contracts/useSmartContractQuery/useSmartContractQuery";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useConvergentCurvePools(
  signerOrProvider?: Signer | Provider
): (ConvergentCurvePool | undefined)[] {
  const { convergentPoolFactoryAddress } = ContractAddresses;

  const convergentPoolFactory = useSmartContractFromFactory(
    convergentPoolFactoryAddress,
    ConvergentPoolFactory__factory.connect
  );

  const { data: events } = useSmartContractQuery(
    convergentPoolFactory,
    "PoolRegistered",
    { callArgs: [null] }
  );

  const convergentPoolContracts =
    events?.map<ConvergentCurvePool>((event) =>
      ConvergentCurvePool__factory.connect(
        event.args?.pool,
        signerOrProvider ?? jsonRpcProvider
      )
    ) || [];

  return convergentPoolContracts;
}
