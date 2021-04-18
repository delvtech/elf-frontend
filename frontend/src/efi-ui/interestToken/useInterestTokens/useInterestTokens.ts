import { Provider } from "@ethersproject/providers";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestTokenFactory__factory } from "elf-contracts/types/factories/InterestTokenFactory__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { InterestTokenFactory } from "elf-contracts/types/InterestTokenFactory";
import { Signer } from "ethers";

import { useSmartContractEvents } from "efi-ui/contracts/useSmartContractEvents/useSmartContractEvents";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

type InterestTokenCreatedFilterOptions = Parameters<
  InterestTokenFactory["filters"]["InterestTokenCreated"]
>;
export function useInterestTokenContracts(
  signerOrProvider?: Signer | Provider | undefined,
  filterOptions: InterestTokenCreatedFilterOptions = [null, null]
): InterestToken[] {
  const { interestTokenFactoryAddress } = ContractAddresses;

  const interestTokenFactoryContract = useSmartContractFromFactory(
    interestTokenFactoryAddress,
    InterestTokenFactory__factory.connect
  );

  const { data: events } = useSmartContractEvents(
    interestTokenFactoryContract,
    "InterestTokenCreated",
    { callArgs: filterOptions }
  );

  const interestTokenAddresses =
    (events?.map(
      (event) =>
        // The first arg is the trancheAddress
        event.args?.[0]
    ) as (string | undefined)[]) || [];

  const interestTokenContracts = useSmartContractsFromFactory(
    interestTokenAddresses,
    InterestToken__factory.connect,
    signerOrProvider
  );

  const validTokens = interestTokenContracts.filter(
    (contract): contract is InterestToken => !!contract
  );

  if (!validTokens.length) {
    return [];
  }

  return validTokens;
}
