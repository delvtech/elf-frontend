import { AddressesJson } from "efi/addresses/addresses";
import { defaultProvider } from "efi/providers/providers";
import { Vault__factory } from "elf-contracts-typechain/dist/types/factories/Vault__factory";

export const balancerVaultContract = Vault__factory.connect(
  AddressesJson.addresses.balancerVaultAddress,
  defaultProvider
);
