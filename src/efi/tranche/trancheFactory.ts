import { TrancheFactory__factory } from "@elementfi/core-typechain";
import { AddressesJson } from "addresses/addresses";
import { defaultProvider } from "efi/providers/providers";

export const trancheFactoryContract = TrancheFactory__factory.connect(
  AddressesJson.addresses.trancheFactoryAddress,
  defaultProvider
);
