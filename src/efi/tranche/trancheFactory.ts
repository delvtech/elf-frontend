import { AddressesJson } from "efi/addresses/addresses";
import { defaultProvider } from "efi/providers/providers";
import { TrancheFactory__factory } from "elf-contracts-typechain/dist/types/factories/TrancheFactory__factory";

export const trancheFactoryContract = TrancheFactory__factory.connect(
  AddressesJson.addresses.trancheFactoryAddress,
  defaultProvider
);
