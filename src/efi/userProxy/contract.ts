import { UserProxy__factory } from "@elementfi/core-typechain";
import { AddressesJson } from "addresses/addresses";
import { defaultProvider } from "efi/providers/providers";

export const userProxyContract = UserProxy__factory.connect(
  AddressesJson.addresses.userProxyContractAddress,
  defaultProvider
);
