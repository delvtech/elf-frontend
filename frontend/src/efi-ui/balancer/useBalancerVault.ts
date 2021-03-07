import { Vault, Vault__factory } from "elf-contracts/types";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import ContractAddresses from "efi/contracts/contractsJson";

export function useBalancerVault(): Vault | undefined {
  return useSmartContractFromFactory(
    ContractAddresses.balancerVaultAddress,
    Vault__factory.connect
  );
}
