import { Provider } from "@ethersproject/providers";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { YVaultAssetProxy } from "elf-contracts/types/YVaultAssetProxy";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

export function useYVaultAssetProxyContracts(
  provider?: Provider
): (YVaultAssetProxy | undefined)[] {
  const wethYVaultAssetProxyContract = useSmartContractFromFactory(
    ContractAddresses.yearnVaultAssetProxyAddress,
    YVaultAssetProxy__factory.connect,
    provider
  );

  return [wethYVaultAssetProxyContract];
}

// TODO: Use this factory based approach once the YVaultAssetProxyFactory exists
// function makeYVaultAssetProxyQueryFn(provider?: Provider) {
//   const defaultProvider = provider ?? jsonRpcProvider;
//   return async () => {
//     // TODO: swap this out for YVaultAssetProxy address
//     const { elfFactoryAddress, elementAddress } = ContractAddresses;
//     const elfFactoryContract = ElfFactory__factory.connect(
//       elfFactoryAddress,
//       defaultProvider
//     );

//     // filter only for Elf contracts that Element has deployed
//     const filter = elfFactoryContract.filters.NewPool(elementAddress, null);
//     const filterResults = await elfFactoryContract.queryFilter(filter);
//     const elfAddresses = filterResults.map<string>(
//       (result) => result.args?.pool
//     );
//     return elfAddresses;
//   };
// }
