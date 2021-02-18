import { useQuery } from "react-query";

import { Provider } from "@ethersproject/providers";
import { Elf } from "elf-contracts/types/Elf";
import { Elf__factory } from "elf-contracts/types/factories/Elf__factory";
import { ElfFactory__factory } from "elf-contracts/types/factories/ElfFactory__factory";

import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useElfContracts(provider?: Provider): (Elf | undefined)[] {
  const queryKey = "elf-contracts";
  const queryFn = makeElfAddressesQueryFn(provider);

  const { data: elfAddresses } = useQuery({ queryKey, queryFn });

  if (!elfAddresses) {
    return [];
  }

  const elfContracts = elfAddresses.map((address) =>
    Elf__factory.connect(address, jsonRpcProvider)
  );
  return elfContracts;
}

function makeElfAddressesQueryFn(provider?: Provider) {
  const defaultProvider = provider ?? jsonRpcProvider;
  return async () => {
    const { elfFactoryAddress, elementAddress } = ContractAddresses;
    const elfFactoryContract = ElfFactory__factory.connect(
      elfFactoryAddress,
      defaultProvider
    );

    // filter only for Elf contracts that Element has deployed
    const filter = elfFactoryContract.filters.NewPool(elementAddress, null);
    const filterResults = await elfFactoryContract.queryFilter(filter);
    const elfAddresses = filterResults.map<string>(
      (result) => result.args?.pool
    );
    return elfAddresses;
  };
}
