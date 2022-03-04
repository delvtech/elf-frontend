import { AddressesJson } from "addresses/addresses";
import { defaultProvider } from "elf/providers/providers";
import { Vault__factory } from "@elementfi/core-typechain";

export const balancerVaultContract = Vault__factory.connect(
  AddressesJson.addresses.balancerVaultAddress,
  defaultProvider
);
