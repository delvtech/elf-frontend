import { AddressesJson } from "efi/addresses";
import { defaultProvider } from "efi/providers/providers";
import { Vault__factory } from "elf-contracts/types/factories/Vault__factory";

export const balancerVaultContract = Vault__factory.connect(
  AddressesJson.addresses.balancerVaultAddress,
  defaultProvider
);
