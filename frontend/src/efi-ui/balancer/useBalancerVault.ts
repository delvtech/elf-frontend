import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";
import { Vault } from "elf-contracts/types/Vault";

import ContractAddresses from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

// TODO: rename this to getBalancerVault, remove cast when getSmartContractFromRegistry no longer
// returns possible undefined
export function useBalancerVault(): Vault {
  return getSmartContractFromRegistry(
    ContractAddresses.balancerVaultAddress,
    Vault__factory.connect
  ) as Vault;
}
