import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";
import { Vault } from "elf-contracts/types/Vault";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

export function useBalancerVault(): Vault | undefined {
  return useSmartContractFromFactory(
    ContractAddresses.balancerVaultAddress,
    Vault__factory.connect
  );
}
