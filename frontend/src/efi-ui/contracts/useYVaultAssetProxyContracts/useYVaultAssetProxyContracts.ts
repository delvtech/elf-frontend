import { Provider } from "@ethersproject/providers";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { YVaultAssetProxy } from "elf-contracts/types/YVaultAssetProxy";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

export function useYVaultAssetProxyContracts(
  provider?: Provider
): (YVaultAssetProxy | undefined)[] {
  const wethYVaultAssetProxyContract = useSmartContractFromFactory(
    ContractAddresses.wethYearnVaultAssetProxyAddress,
    YVaultAssetProxy__factory.connect,
    provider
  );

  return [wethYVaultAssetProxyContract];
}
