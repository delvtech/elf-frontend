import { AddressesJson } from "efi/addresses";
import { defaultProvider } from "efi/providers/providers";
import { UserProxy__factory } from "elf-contracts/types/factories/UserProxy__factory";

export const userProxyContract = UserProxy__factory.connect(
  AddressesJson.addresses.userProxyContractAddress,
  defaultProvider
);
