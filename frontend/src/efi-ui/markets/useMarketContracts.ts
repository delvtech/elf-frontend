import { useQuery } from "react-query";

import { BFactory__factory } from "elf-contracts/types/factories/BFactory__factory";
import { BPool__factory } from "elf-contracts/types/factories/BPool__factory";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useMarketContracts() {
  const queryKey = "market-contracts";
  const queryFn = fetchMarketContractAddresses;

  const { data } = useQuery({ queryKey, queryFn });

  if (!data) {
    return [];
  }

  // 'args' are the args passed to the 'NewBPool' event.  The second one is the address of the new
  // pool.
  const bPoolAddresses = data.map<string>((result) => result.args?.[1]);
  const bPoolContracts = bPoolAddresses.map((address) =>
    BPool__factory.connect(address, jsonRpcProvider)
  );
  return bPoolContracts;
}

function fetchMarketContractAddresses() {
  const { elementAddress, bFactoryAddress } = ContractAddresses;
  const bFactoryContract = BFactory__factory.connect(
    bFactoryAddress,
    jsonRpcProvider
  );
  const filter = bFactoryContract.filters.LOG_NEW_POOL(elementAddress, null);
  return bFactoryContract.queryFilter(filter);
}
