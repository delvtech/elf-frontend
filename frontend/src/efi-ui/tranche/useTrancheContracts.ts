import { Provider } from "@ethersproject/providers";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { TrancheFactory__factory } from "elf-contracts/types/factories/TrancheFactory__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { TrancheFactory } from "elf-contracts/types/TrancheFactory";
import { Signer } from "ethers";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractQuery } from "efi-ui/contracts/useSmartContractQuery/useSmartContractQuery";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

type TrancheFilterOptions = Parameters<
  TrancheFactory["filters"]["TrancheCreated"]
>;
export function useTrancheContracts(
  signerOrProvider?: Signer | Provider | undefined,
  filterOptions: TrancheFilterOptions = [null, null, null]
): Tranche[] {
  const { trancheFactoryAddress } = ContractAddresses;

  const trancheFactoryContract = useSmartContractFromFactory(
    trancheFactoryAddress,
    TrancheFactory__factory.connect
  );

  const { data: events } = useSmartContractQuery(
    trancheFactoryContract,
    "TrancheCreated",
    { callArgs: filterOptions }
  );

  const trancheAddresses =
    (events?.map(
      (event) =>
        // The first arg is the trancheAddress
        event.args?.[0]
    ) as (string | undefined)[]) || [];

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
