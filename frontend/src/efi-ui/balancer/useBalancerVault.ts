import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";
import { Vault } from "elf-contracts/types/Vault";

import ContractAddresses from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

export function useBalancerVault(): Vault | undefined {
  return getSmartContractFromRegistry(
    ContractAddresses.balancerVaultAddress,
    Vault__factory.connect
  );
}
